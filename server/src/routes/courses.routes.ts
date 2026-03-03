import express from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: {
    userId: string;
    role: string;
  };
}

router.get('/public', async (req: express.Request, res: express.Response) => {
  try {
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
        u.email as trainer_email
      FROM courses c
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE c.is_active = 1
      ORDER BY c.created_at DESC
    `);

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
    console.error('Public courses fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/available', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (userRole !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can access available courses' });
    }

    const [enrolledRows] = await pool.query<RowDataPacket[]>(`
      SELECT course_id FROM enrollments WHERE student_id = ?
    `, [userId]);

    const enrolledCourseIds = enrolledRows.map((row: any) => row.course_id);

    let query = `
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
        u.email as trainer_email
      FROM courses c
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE c.is_active = 1
    `;

    if (enrolledCourseIds.length > 0) {
      query += ` AND c.id NOT IN (${enrolledCourseIds.map(() => '?').join(',')})`;
    }

    query += ' ORDER BY c.created_at DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, enrolledCourseIds);

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
    console.error('Available courses fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    let query = `
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
        u.email as trainer_email
      FROM courses c
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    if (userRole === 'trainer') {
      query += ' AND c.trainer_id = ?';
      queryParams.push(userId);
    } else if (userRole === 'student') {
      query += ' AND c.is_active = 1';
    }

    query += ' ORDER BY c.created_at DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);

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
    console.error('Courses fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    let query = `
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
        u.email as trainer_email
      FROM courses c
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE c.id = ?
    `;

    const queryParams: any[] = [id];

    if (userRole === 'trainer') {
      query += ' AND c.trainer_id = ?';
      queryParams.push(userId);
    } else if (userRole === 'student') {
      query += ' AND c.is_active = 1';
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const row: any = rows[0];
    const course = {
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
    };

    res.json({ success: true, data: course });
  } catch (error: any) {
    console.error('Course fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
