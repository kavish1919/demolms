import express from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

router.get('/students', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        is_active,
        created_at,
        last_login
      FROM users 
      WHERE LOWER(role) = 'student'
      ORDER BY created_at DESC
    `);

    const students = rows.map((row: any) => ({
      id: String(row.id),
      email: row.email,
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      phone: row.phone || '',
      role: row.role,
      isActive: row.is_active === 1 || row.is_active === true,
      isBlocked: false,
      avatarUrl: '',
      referralCode: '',
      emailVerified: false,
      dateOfBirth: '',
      createdAt: row.created_at || '',
      lastLogin: row.last_login || '',
    }));

    res.json({ success: true, data: students });
  } catch (error: any) {
    console.error('Students fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/trainers', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        is_active,
        created_at,
        last_login
      FROM users 
      WHERE LOWER(role) = 'trainer'
      ORDER BY created_at DESC
    `);

    const trainers = rows.map((row: any) => ({
      id: String(row.id),
      email: row.email,
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      phone: row.phone || '',
      role: row.role,
      isActive: row.is_active === 1 || row.is_active === true,
      avatarUrl: '',
      createdAt: row.created_at || '',
      lastLogin: row.last_login || '',
    }));

    res.json({ success: true, data: trainers });
  } catch (error: any) {
    console.error('Trainers fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
