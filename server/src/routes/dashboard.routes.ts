import express from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    let totalStudents = 0;
    let totalTrainers = 0;
    let totalCourses = 0;
    let activeCourses = 0;
    let totalRevenue = 0;
    let pendingEnquiries = 0;
    let todayAttendance = 0;
    let pendingApplications = 0;

    try {
      const [students] = await pool.query<RowDataPacket[]>(`
        SELECT COUNT(*) as count FROM users WHERE LOWER(role) = 'student' AND is_active = 1
      `);
      totalStudents = students[0]?.count || 0;
    } catch (e) { console.error('Students query error:', e); }

    try {
      const [trainers] = await pool.query<RowDataPacket[]>(`
        SELECT COUNT(*) as count FROM users WHERE LOWER(role) = 'trainer' AND is_active = 1
      `);
      totalTrainers = trainers[0]?.count || 0;
    } catch (e) { console.error('Trainers query error:', e); }

    try {
      const [courses] = await pool.query<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
        FROM courses
      `);
      totalCourses = courses[0]?.total || 0;
      activeCourses = courses[0]?.active || 0;
    } catch (e) { console.error('Courses query error:', e); }

    try {
      const [revenue] = await pool.query<RowDataPacket[]>(`
        SELECT COALESCE(SUM(amount), 0) as total_revenue
        FROM payments
        WHERE status = 'success'
      `);
      totalRevenue = Number(revenue[0]?.total_revenue) || 0;
    } catch (e) { console.error('Revenue query error:', e); }

    try {
      const [enquiries] = await pool.query<RowDataPacket[]>(`
        SELECT COUNT(*) as count FROM enquiries WHERE status = 'new'
      `);
      pendingEnquiries = enquiries[0]?.count || 0;
    } catch (e) { console.error('Enquiries query error:', e); }

    try {
      const [applications] = await pool.query<RowDataPacket[]>(`
        SELECT COUNT(*) as count FROM trainer_applications WHERE status = 'pending'
      `);
      pendingApplications = applications[0]?.count || 0;
    } catch (e) { console.error('Applications query error:', e); }

    try {
      const [attendance] = await pool.query<RowDataPacket[]>(`
        SELECT 
          ROUND(
            (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(*), 0),
            0
          ) as percentage
        FROM attendance
        WHERE date = CURDATE()
      `);
      todayAttendance = attendance[0]?.percentage || 0;
    } catch (e) { console.error('Attendance query error:', e); }

    res.json({ 
      success: true, 
      data: { 
        totalStudents,
        totalTrainers,
        totalCourses,
        activeCourses,
        totalRevenue,
        pendingEnquiries,
        pendingApplications,
        todayAttendance,
      } 
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

router.get('/counts', async (req, res) => {
  try {
    let totalStudents = 0;
    let totalTrainers = 0;

    try {
      const [students] = await pool.query<RowDataPacket[]>(`
        SELECT COUNT(*) as count FROM users WHERE LOWER(role) = 'student' AND is_active = 1
      `);
      totalStudents = students[0]?.count || 0;
    } catch (e) { console.error('Students count error:', e); }

    try {
      const [trainers] = await pool.query<RowDataPacket[]>(`
        SELECT COUNT(*) as count FROM users WHERE LOWER(role) = 'trainer' AND is_active = 1
      `);
      totalTrainers = trainers[0]?.count || 0;
    } catch (e) { console.error('Trainers count error:', e); }

    res.json({ 
      success: true, 
      data: { 
        totalStudents,
        totalTrainers
      } 
    });
  } catch (error) {
    console.error('Counts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch counts' });
  }
});

router.get('/recent-payments', async (req, res) => {
  try {
    const [payments] = await pool.query<RowDataPacket[]>(`
      SELECT 
        p.id,
        p.student_id,
        p.course_id,
        p.amount,
        p.status,
        p.created_at,
        u.first_name AS student_first_name,
        u.last_name AS student_last_name,
        u.avatar AS student_avatar,
        c.title AS course_title
      FROM payments p
      JOIN users u ON p.student_id = u.id
      JOIN courses c ON p.course_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    const formattedPayments = payments.map((row: any) => ({
      id: String(row.id),
      studentId: String(row.student_id),
      courseId: String(row.course_id),
      amount: Number(row.amount),
      status: row.status,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      student: {
        firstName: row.student_first_name || '',
        lastName: row.student_last_name || '',
        avatarUrl: row.student_avatar || '',
      },
      course: {
        title: row.course_title || '',
      },
    }));

    res.json({ success: true, data: formattedPayments });
  } catch (error) {
    console.error('Recent payments error:', error);
    res.json({ success: true, data: [] });
  }
});

router.get('/recent-enquiries', async (req, res) => {
  try {
    const [enquiries] = await pool.query<RowDataPacket[]>(`
      SELECT 
        e.id,
        e.student_name,
        e.course_id,
        e.status,
        e.created_at,
        c.title AS course_title
      FROM enquiries e
      LEFT JOIN courses c ON e.course_id = c.id
      ORDER BY e.created_at DESC
      LIMIT 10
    `);

    const formattedEnquiries = enquiries.map((row: any) => ({
      id: String(row.id),
      studentName: row.student_name || '',
      courseId: row.course_id ? String(row.course_id) : '',
      status: row.status,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      course: row.course_title ? { title: row.course_title } : undefined,
    }));

    res.json({ success: true, data: formattedEnquiries });
  } catch (error) {
    console.error('Recent enquiries error:', error);
    res.json({ success: true, data: [] });
  }
});

export default router;
