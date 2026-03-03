import express from 'express';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from 'pg-sdk-node';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

let phonePeClient: StandardCheckoutClient | null = null;

const getPhonePeClient = (): StandardCheckoutClient => {
  if (!phonePeClient) {
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || '1', 10);
    const env = process.env.PHONEPE_ENV === 'production' ? Env.PRODUCTION : Env.SANDBOX;

    if (!clientId || !clientSecret) {
      throw new Error('PhonePe credentials not configured');
    }

    phonePeClient = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
  }
  return phonePeClient;
};

router.post('/guest-checkout', async (req: AuthRequest, res: express.Response) => {
  const connection = await pool.getConnection();
  try {
    const { courseId, firstName, lastName, email, mobile, password } = req.body;

    if (!courseId || !firstName || !lastName || !email || !mobile || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const [existingUsers] = await connection.query<RowDataPacket[]>(`
      SELECT id FROM users WHERE email = ?
    `, [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists. Please login to purchase.' });
    }

    const [courseRows] = await connection.query<RowDataPacket[]>(`
      SELECT id, title, fee, discount_fee, is_active 
      FROM courses 
      WHERE id = ?
    `, [courseId]);

    if (courseRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    const course = courseRows[0];

    if (!course.is_active) {
      return res.status(400).json({ success: false, error: 'Cannot pay for an inactive course.' });
    }

    const amount = course.discount_fee ? Number(course.discount_fee) : Number(course.fee);
    const merchantOrderId = `ORDER_${randomUUID()}`;
    const redirectUrl = process.env.PHONEPE_REDIRECT_URL || `http://localhost:3000/payment/success`;

    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 10);

    const fullName = `${firstName} ${lastName}`.trim();

    const [userResult] = await connection.query<ResultSetHeader>(`
      INSERT INTO users (full_name, first_name, last_name, email, phone, role, is_active, password, created_at)
      VALUES (?, ?, ?, ?, ?, 'student', 0, ?, NOW())
    `, [fullName, firstName, lastName, email, mobile, passwordHash]);

    const userId = userResult.insertId;

    await connection.query(`
      INSERT INTO login_details (user_id, username, password, status)
      VALUES (?, ?, ?, '1')
    `, [userId, email, passwordHash]);

    const [paymentResult] = await connection.query<ResultSetHeader>(`
      INSERT INTO payments (student_id, course_id, amount, status, transaction_id)
      VALUES (?, ?, ?, 'pending', ?)
    `, [userId, courseId, amount, merchantOrderId]);

    const paymentId = paymentResult.insertId;

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(Math.round(amount * 100))
      .redirectUrl(`${redirectUrl}?paymentId=${paymentId}&userId=${userId}`)
      .build();

    const client = getPhonePeClient();
    const response = await client.pay(request);

    await connection.commit();

    res.json({
      success: true,
      data: {
        paymentId,
        merchantOrderId,
        redirectUrl: response.redirectUrl,
        amount,
      },
    });
  } catch (error: any) {
    await connection.rollback();
    console.error('Guest checkout error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to initiate checkout' });
  } finally {
    connection.release();
  }
});

router.post('/verify-guest', async (req: AuthRequest, res: express.Response) => {
  const connection = await pool.getConnection();
  try {
    const { paymentId, merchantOrderId, userId } = req.body;

    if (!paymentId || !merchantOrderId || !userId) {
      return res.status(400).json({ success: false, error: 'Payment ID, Merchant Order ID, and User ID are required.' });
    }

    const [paymentRows] = await connection.query<RowDataPacket[]>(`
      SELECT id, student_id, course_id, amount, status, transaction_id
      FROM payments 
      WHERE id = ? AND transaction_id = ?
    `, [paymentId, merchantOrderId]);

    if (paymentRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment record not found.' });
    }

    const payment = paymentRows[0];

    if (payment.status === 'success') {
      const token = jwt.sign(
        { userId: payment.student_id, role: 'student' },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Payment already verified',
        data: { 
          status: 'success', 
          courseId: payment.course_id,
          token,
          user: {
            id: payment.student_id,
            role: 'student'
          }
        }
      });
    }

    const client = getPhonePeClient();
    const statusResponse = await client.getOrderStatus(merchantOrderId);

    await connection.beginTransaction();

    if (statusResponse.state === 'COMPLETED') {
      const transactionId = statusResponse.paymentDetails?.[0]?.transactionId;
      await connection.query(`
        UPDATE payments 
        SET status = 'success', phonepe_transaction_id = ?
        WHERE id = ?
      `, [transactionId, paymentId]);

      await connection.query(`
        UPDATE users SET is_active = 1 WHERE id = ?
      `, [payment.student_id]);

      const [existingEnrollment] = await connection.query<RowDataPacket[]>(`
        SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?
      `, [payment.student_id, payment.course_id]);

      if (existingEnrollment.length === 0) {
        await connection.query(`
          INSERT INTO enrollments (student_id, course_id, status, progress_percent)
          VALUES (?, ?, 'active', 0)
        `, [payment.student_id, payment.course_id]);

        await connection.query(`
          UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = ?
        `, [payment.course_id]);
      }

      await connection.commit();

      const token = jwt.sign(
        { userId: payment.student_id, role: 'student' },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: { 
          status: 'success', 
          courseId: payment.course_id,
          token,
          user: {
            id: payment.student_id,
            role: 'student'
          }
        }
      });
    } else {
      await connection.query(`
        UPDATE payments SET status = 'failed' WHERE id = ?
      `, [paymentId]);

      await connection.commit();

      res.json({
        success: false,
        message: 'Payment not completed',
        data: { status: statusResponse.state || 'failed' }
      });
    }
  } catch (error: any) {
    await connection.rollback();
    console.error('Guest payment verification error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to verify payment' });
  } finally {
    connection.release();
  }
});

router.get('/admin', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required.' });
    }

    const [totalRevenueRows] = await pool.query<RowDataPacket[]>(`
      SELECT COALESCE(SUM(amount), 0) AS total_revenue
      FROM payments
      WHERE status = 'success'
    `);

    const [todayPaymentsRows] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) AS count
      FROM payments
      WHERE DATE(created_at) = CURDATE()
      AND status = 'success'
    `);

    const [pendingAmountRows] = await pool.query<RowDataPacket[]>(`
      SELECT COALESCE(SUM(amount), 0) AS pending_amount
      FROM payments
      WHERE status = 'pending'
    `);

    const [refundedAmountRows] = await pool.query<RowDataPacket[]>(`
      SELECT COALESCE(SUM(amount), 0) AS refunded_amount
      FROM payments
      WHERE status = 'refunded'
    `);

    const [totalCountRows] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) AS count FROM payments
    `);

    const [payments] = await pool.query<RowDataPacket[]>(`
      SELECT 
        p.id,
        p.student_id,
        p.course_id,
        p.amount,
        p.currency,
        p.status,
        p.payment_method,
        p.transaction_id,
        p.phonepe_merchant_id,
        p.phonepe_transaction_id,
        p.created_at,
        p.updated_at,
        u.first_name AS student_first_name,
        u.last_name AS student_last_name,
        u.email AS student_email,
        u.avatar AS student_avatar,
        c.title AS course_title,
        c.short_description AS course_short_description
      FROM payments p
      JOIN users u ON p.student_id = u.id
      JOIN courses c ON p.course_id = c.id
      ORDER BY p.created_at DESC
    `);

    const formattedPayments = payments.map((row: any) => ({
      id: String(row.id),
      studentId: String(row.student_id),
      courseId: String(row.course_id),
      amount: Number(row.amount),
      currency: row.currency || 'INR',
      status: row.status,
      paymentMethod: row.payment_method,
      transactionId: row.transaction_id,
      phonepeMerchantId: row.phonepe_merchant_id,
      phonepeTransactionId: row.phonepe_transaction_id,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      student: {
        id: String(row.student_id),
        firstName: row.student_first_name || '',
        lastName: row.student_last_name || '',
        email: row.student_email || '',
        avatarUrl: row.student_avatar || '',
      },
      course: {
        title: row.course_title || '',
        shortDescription: row.course_short_description || '',
      },
    }));

    res.json({
      success: true,
      data: {
        totalRevenue: Number(totalRevenueRows[0]?.total_revenue) || 0,
        todayPayments: Number(todayPaymentsRows[0]?.count) || 0,
        pendingAmount: Number(pendingAmountRows[0]?.pending_amount) || 0,
        refundedAmount: Number(refundedAmountRows[0]?.refunded_amount) || 0,
        totalTransactions: Number(totalCountRows[0]?.count) || 0,
        payments: formattedPayments,
      },
    });
  } catch (error: any) {
    console.error('Admin payments fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/student', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    if (req.user?.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Student access required.' });
    }

    const userId = req.user.userId;

    const [payments] = await pool.query<RowDataPacket[]>(`
      SELECT 
        p.id,
        p.student_id,
        p.course_id,
        p.amount,
        p.currency,
        p.status,
        p.payment_method,
        p.transaction_id,
        p.phonepe_transaction_id,
        p.created_at,
        p.updated_at,
        c.title AS course_title,
        c.short_description AS course_short_description
      FROM payments p
      JOIN courses c ON p.course_id = c.id
      WHERE p.student_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    const formattedPayments = payments.map((row: any) => ({
      id: String(row.id),
      studentId: String(row.student_id),
      courseId: String(row.course_id),
      amount: Number(row.amount),
      currency: row.currency || 'INR',
      status: row.status,
      paymentMethod: row.payment_method,
      transactionId: row.transaction_id,
      phonepeTransactionId: row.phonepe_transaction_id,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      course: {
        title: row.course_title || '',
        shortDescription: row.course_short_description || '',
      },
    }));

    res.json({ success: true, data: formattedPayments });
  } catch (error: any) {
    console.error('Student payments fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/trainer', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    if (req.user?.role !== 'trainer') {
      return res.status(403).json({ success: false, error: 'Trainer access required.' });
    }

    const userId = req.user.userId;

    const [revenueRows] = await pool.query<RowDataPacket[]>(`
      SELECT COALESCE(SUM(p.amount), 0) AS trainer_revenue
      FROM payments p
      JOIN courses c ON p.course_id = c.id
      WHERE c.trainer_id = ?
      AND p.status = 'success'
    `, [userId]);

    const [payments] = await pool.query<RowDataPacket[]>(`
      SELECT 
        u.first_name AS student_first_name,
        u.last_name AS student_last_name,
        u.email AS student_email,
        c.title AS course_title,
        p.amount,
        p.status,
        p.payment_method,
        p.transaction_id,
        p.created_at
      FROM payments p
      JOIN users u ON p.student_id = u.id
      JOIN courses c ON p.course_id = c.id
      WHERE c.trainer_id = ?
      AND p.status = 'success'
      ORDER BY p.created_at DESC
    `, [userId]);

    const formattedPayments = payments.map((row: any) => ({
      studentName: `${row.student_first_name || ''} ${row.student_last_name || ''}`.trim(),
      studentEmail: row.student_email || '',
      courseTitle: row.course_title || '',
      amount: Number(row.amount),
      status: row.status,
      paymentMethod: row.payment_method,
      transactionId: row.transaction_id,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    }));

    res.json({
      success: true,
      data: {
        trainerRevenue: Number(revenueRows[0]?.trainer_revenue) || 0,
        payments: formattedPayments,
      },
    });
  } catch (error: any) {
    console.error('Trainer payments fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/create', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  const connection = await pool.getConnection();
  try {
    if (req.user?.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can create payments.' });
    }

    const { courseId } = req.body;
    const studentId = req.user.userId;

    if (!courseId) {
      return res.status(400).json({ success: false, error: 'Course ID is required.' });
    }

    const [courseRows] = await connection.query<RowDataPacket[]>(`
      SELECT id, title, fee, discount_fee, is_active 
      FROM courses 
      WHERE id = ?
    `, [courseId]);

    if (courseRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    const course = courseRows[0];

    if (!course.is_active) {
      return res.status(400).json({ success: false, error: 'Cannot pay for an inactive course.' });
    }

    const [existingEnrollment] = await connection.query<RowDataPacket[]>(`
      SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?
    `, [studentId, courseId]);

    if (existingEnrollment.length > 0) {
      return res.status(400).json({ success: false, error: 'Already enrolled in this course.' });
    }

    const [existingPayment] = await connection.query<RowDataPacket[]>(`
      SELECT id, status FROM payments WHERE student_id = ? AND course_id = ? AND status IN ('pending', 'success')
    `, [studentId, courseId]);

    if (existingPayment.length > 0) {
      if (existingPayment[0].status === 'success') {
        return res.status(400).json({ success: false, error: 'Already paid for this course.' });
      }
      await connection.query(`DELETE FROM payments WHERE id = ?`, [existingPayment[0].id]);
    }

    const amount = course.discount_fee ? Number(course.discount_fee) : Number(course.fee);
    const merchantOrderId = `ORDER_${randomUUID()}`;
    const redirectUrl = process.env.PHONEPE_REDIRECT_URL || `http://localhost:3000/payment/success`;

    await connection.beginTransaction();

    const [paymentResult] = await connection.query<ResultSetHeader>(`
      INSERT INTO payments (student_id, course_id, amount, status, transaction_id)
      VALUES (?, ?, ?, 'pending', ?)
    `, [studentId, courseId, amount, merchantOrderId]);

    const paymentId = paymentResult.insertId;

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(Math.round(amount * 100))
      .redirectUrl(redirectUrl)
      .build();

    const client = getPhonePeClient();
    const response = await client.pay(request);

    await connection.commit();

    res.json({
      success: true,
      data: {
        paymentId,
        merchantOrderId,
        redirectUrl: response.redirectUrl,
        amount,
      },
    });
  } catch (error: any) {
    await connection.rollback();
    console.error('Payment creation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create payment' });
  } finally {
    connection.release();
  }
});

router.post('/verify', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  const connection = await pool.getConnection();
  try {
    if (req.user?.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can verify payments.' });
    }

    const { paymentId, merchantOrderId } = req.body;
    const studentId = req.user.userId;

    if (!paymentId || !merchantOrderId) {
      return res.status(400).json({ success: false, error: 'Payment ID and Merchant Order ID are required.' });
    }

    const [paymentRows] = await connection.query<RowDataPacket[]>(`
      SELECT id, student_id, course_id, amount, status, transaction_id
      FROM payments 
      WHERE id = ? AND student_id = ? AND transaction_id = ?
    `, [paymentId, studentId, merchantOrderId]);

    if (paymentRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment record not found.' });
    }

    const payment = paymentRows[0];

    if (payment.status === 'success') {
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: { status: 'success', courseId: payment.course_id }
      });
    }

    const client = getPhonePeClient();
    const statusResponse = await client.getOrderStatus(merchantOrderId);

    await connection.beginTransaction();

    if (statusResponse.state === 'COMPLETED') {
      const transactionId = statusResponse.paymentDetails?.[0]?.transactionId;
      await connection.query(`
        UPDATE payments 
        SET status = 'success', phonepe_transaction_id = ?
        WHERE id = ?
      `, [transactionId, paymentId]);

      const [existingEnrollment] = await connection.query<RowDataPacket[]>(`
        SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?
      `, [studentId, payment.course_id]);

      if (existingEnrollment.length === 0) {
        await connection.query(`
          INSERT INTO enrollments (student_id, course_id, status, progress_percent)
          VALUES (?, ?, 'active', 0)
        `, [studentId, payment.course_id]);

        await connection.query(`
          UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = ?
        `, [payment.course_id]);
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: { status: 'success', courseId: payment.course_id }
      });
    } else {
      await connection.query(`
        UPDATE payments SET status = 'failed' WHERE id = ?
      `, [paymentId]);

      await connection.commit();

      res.json({
        success: false,
        message: 'Payment not completed',
        data: { status: statusResponse.state || 'failed' }
      });
    }
  } catch (error: any) {
    await connection.rollback();
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to verify payment' });
  } finally {
    connection.release();
  }
});

router.post('/callback', async (req: express.Request, res: express.Response) => {
  try {
    const { merchantOrderId, transactionId, state } = req.body;

    console.log('PhonePe callback received:', { merchantOrderId, transactionId, state });

    if (!merchantOrderId) {
      return res.status(400).json({ success: false, error: 'Invalid callback' });
    }

    const [paymentRows] = await pool.query<RowDataPacket[]>(`
      SELECT id, status FROM payments WHERE transaction_id = ?
    `, [merchantOrderId]);

    if (paymentRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    const payment = paymentRows[0];

    if (payment.status === 'success') {
      return res.json({ success: true, message: 'Already processed' });
    }

    const newStatus = state === 'COMPLETED' ? 'success' : 'failed';

    await pool.query(`
      UPDATE payments SET status = ?, phonepe_transaction_id = ? WHERE id = ?
    `, [newStatus, transactionId, payment.id]);

    if (state === 'COMPLETED') {
      const [paymentDetails] = await pool.query<RowDataPacket[]>(`
        SELECT student_id, course_id FROM payments WHERE id = ?
      `, [payment.id]);

      if (paymentDetails.length > 0) {
        const { student_id, course_id } = paymentDetails[0];

        const [existingEnrollment] = await pool.query<RowDataPacket[]>(`
          SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?
        `, [student_id, course_id]);

        if (existingEnrollment.length === 0) {
          await pool.query(`
            INSERT INTO enrollments (student_id, course_id, status, progress_percent)
            VALUES (?, ?, 'active', 0)
          `, [student_id, course_id]);

          await pool.query(`
            UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = ?
          `, [course_id]);
        }
      }
    }

    res.json({ success: true, message: 'Callback processed' });
  } catch (error: any) {
    console.error('PhonePe callback error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
