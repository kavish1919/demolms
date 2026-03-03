import express from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: {
    userId: number;
    role: string;
  };
}

router.get('/student/courses', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (userRole !== 'student') {
      return res.status(403).json({ success: false, error: 'Access denied. Student role required.' });
    }

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        c.id,
        c.title,
        c.slug,
        c.description,
        c.short_description,
        c.thumbnail_url,
        c.intro_video_url,
        c.duration_hours,
        c.fee,
        c.discount_fee,
        c.trainer_id,
        c.is_active,
        c.is_featured,
        c.max_students,
        c.enrollment_count,
        c.rating,
        c.category,
        c.level,
        c.created_at,
        c.updated_at,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name,
        u.email as trainer_email,
        e.id as enrollment_id,
        e.status as enrollment_status,
        e.progress_percent,
        e.enrolled_at,
        e.completed_at
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `, [userId]);

    const courses = rows.map((row: any) => ({
      id: String(row.id),
      title: row.title,
      slug: row.slug,
      description: row.description,
      shortDescription: row.short_description,
      thumbnailUrl: row.thumbnail_url,
      introVideoUrl: row.intro_video_url,
      durationHours: row.duration_hours || 0,
      fee: Number(row.fee) || 0,
      discountFee: row.discount_fee ? Number(row.discount_fee) : undefined,
      trainerId: row.trainer_id ? String(row.trainer_id) : undefined,
      trainer: row.trainer_id ? {
        id: String(row.trainer_id),
        firstName: row.trainer_first_name || '',
        lastName: row.trainer_last_name || '',
        email: row.trainer_email || '',
        role: 'trainer',
      } : undefined,
      isActive: row.is_active === 1 || row.is_active === true,
      isFeatured: row.is_featured === 1 || row.is_featured === true,
      maxStudents: row.max_students,
      enrollmentCount: row.enrollment_count || 0,
      rating: Number(row.rating) || 0,
      category: row.category,
      level: row.level || 'beginner',
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      enrollment: {
        id: String(row.enrollment_id),
        status: row.enrollment_status,
        progressPercent: row.progress_percent || 0,
        enrolledAt: row.enrolled_at ? new Date(row.enrolled_at).toISOString() : new Date().toISOString(),
        completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
      }
    }));

    res.json({ success: true, data: courses });
  } catch (error: any) {
    console.error('Student courses fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/trainer/courses', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (userRole !== 'trainer') {
      return res.status(403).json({ success: false, error: 'Access denied. Trainer role required.' });
    }

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        c.id,
        c.title,
        c.slug,
        c.description,
        c.short_description,
        c.thumbnail_url,
        c.intro_video_url,
        c.duration_hours,
        c.fee,
        c.discount_fee,
        c.trainer_id,
        c.is_active,
        c.is_featured,
        c.max_students,
        c.rating,
        c.category,
        c.level,
        c.created_at,
        c.updated_at,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name,
        u.email as trainer_email,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrollment_count
      FROM courses c
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE c.trainer_id = ?
      ORDER BY c.created_at DESC
    `, [userId]);

    const courses = rows.map((row: any) => ({
      id: String(row.id),
      title: row.title,
      slug: row.slug,
      description: row.description,
      shortDescription: row.short_description,
      thumbnailUrl: row.thumbnail_url,
      introVideoUrl: row.intro_video_url,
      durationHours: row.duration_hours || 0,
      fee: Number(row.fee) || 0,
      discountFee: row.discount_fee ? Number(row.discount_fee) : undefined,
      trainerId: row.trainer_id ? String(row.trainer_id) : undefined,
      trainer: row.trainer_id ? {
        id: String(row.trainer_id),
        firstName: row.trainer_first_name || '',
        lastName: row.trainer_last_name || '',
        email: row.trainer_email || '',
        role: 'trainer',
      } : undefined,
      isActive: row.is_active === 1 || row.is_active === true,
      isFeatured: row.is_featured === 1 || row.is_featured === true,
      maxStudents: row.max_students,
      enrollmentCount: row.enrollment_count || 0,
      rating: Number(row.rating) || 0,
      category: row.category,
      level: row.level || 'beginner',
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    }));

    res.json({ success: true, data: courses });
  } catch (error: any) {
    console.error('Trainer courses fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enroll', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { courseId } = req.body;

    if (userRole !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can enroll in courses.' });
    }

    if (!courseId) {
      return res.status(400).json({ success: false, error: 'Course ID is required.' });
    }

    const [courseRows] = await pool.query<RowDataPacket[]>(`
      SELECT id, max_students, enrollment_count, is_active 
      FROM courses 
      WHERE id = ?
    `, [courseId]);

    if (courseRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    const course = courseRows[0];

    if (!course.is_active) {
      return res.status(400).json({ success: false, error: 'Cannot enroll in an inactive course.' });
    }

    if (course.max_students && course.enrollment_count >= course.max_students) {
      return res.status(400).json({ success: false, error: 'Course is full. Maximum students reached.' });
    }

    const [existingEnrollment] = await pool.query<RowDataPacket[]>(`
      SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?
    `, [userId, courseId]);

    if (existingEnrollment.length > 0) {
      return res.status(400).json({ success: false, error: 'Already enrolled in this course.' });
    }

    const [paymentRows] = await pool.query<RowDataPacket[]>(`
      SELECT id FROM payments 
      WHERE student_id = ? AND course_id = ? AND status = 'success'
      LIMIT 1
    `, [userId, courseId]);

    if (paymentRows.length === 0) {
      return res.status(402).json({ success: false, error: 'Payment required. Please complete payment before enrolling.' });
    }

    await pool.query(`
      INSERT INTO enrollments (student_id, course_id, status, progress_percent)
      VALUES (?, ?, 'active', 0)
    `, [userId, courseId]);

    await pool.query(`
      UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = ?
    `, [courseId]);

    res.json({ success: true, message: 'Successfully enrolled in course.' });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/trainer/students', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (userRole !== 'trainer') {
      return res.status(403).json({ success: false, error: 'Access denied. Trainer role required.' });
    }

    const [courseRows] = await pool.query<RowDataPacket[]>(`
      SELECT id FROM courses WHERE trainer_id = ?
    `, [userId]);

    if (courseRows.length === 0) {
      return res.json({ success: true, data: [], totalStudents: 0 });
    }

    const courseIds = courseRows.map((c: any) => c.id);

    const [studentRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        e.id as enrollment_id,
        e.student_id,
        e.course_id,
        e.status as enrollment_status,
        e.progress_percent,
        e.enrolled_at,
        e.completed_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar,
        c.title as course_title
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE e.course_id IN (?) AND c.trainer_id = ?
      ORDER BY e.enrolled_at DESC
    `, [courseIds, userId]);

    const students = studentRows.map((row: any) => ({
      enrollment: {
        id: String(row.enrollment_id),
        courseId: String(row.course_id),
        courseTitle: row.course_title,
        status: row.enrollment_status,
        progressPercent: row.progress_percent || 0,
        enrolledAt: row.enrolled_at ? new Date(row.enrolled_at).toISOString() : new Date().toISOString(),
        completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
      },
      student: {
        id: String(row.student_id),
        firstName: row.first_name || '',
        lastName: row.last_name || '',
        email: row.email || '',
        phone: row.phone || '',
        avatarUrl: row.avatar || '',
      }
    }));

    const uniqueStudentIds = [...new Set(students.map((s: any) => s.student.id))];

    res.json({ success: true, data: students, totalStudents: uniqueStudentIds.length });
  } catch (error: any) {
    console.error('Trainer students fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/trainer/courses/:courseId/students', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { courseId } = req.params;

    if (userRole !== 'trainer') {
      return res.status(403).json({ success: false, error: 'Access denied. Trainer role required.' });
    }

    const [courseCheck] = await pool.query<RowDataPacket[]>(`
      SELECT id FROM courses WHERE id = ? AND trainer_id = ?
    `, [courseId, userId]);

    if (courseCheck.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found or access denied.' });
    }

    const [studentRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        e.id as enrollment_id,
        e.student_id,
        e.course_id,
        e.status as enrollment_status,
        e.progress_percent,
        e.enrolled_at,
        e.completed_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar,
        c.title as course_title
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE e.course_id = ?
      ORDER BY e.enrolled_at DESC
    `, [courseId]);

    const students = studentRows.map((row: any) => ({
      enrollment: {
        id: String(row.enrollment_id),
        courseId: String(row.course_id),
        courseTitle: row.course_title,
        status: row.enrollment_status,
        progressPercent: row.progress_percent || 0,
        enrolledAt: row.enrolled_at ? new Date(row.enrolled_at).toISOString() : new Date().toISOString(),
        completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
      },
      student: {
        id: String(row.student_id),
        firstName: row.first_name || '',
        lastName: row.last_name || '',
        email: row.email || '',
        phone: row.phone || '',
        avatarUrl: row.avatar || '',
      }
    }));

    res.json({ success: true, data: students });
  } catch (error: any) {
    console.error('Course students fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
