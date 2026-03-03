import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export class AuthController {

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.role,
          u.is_active,
          ld.password
        FROM users u
        JOIN login_details ld ON ld.user_id = u.id
        WHERE ld.username = ? AND ld.status = '1'
      `, [email]);

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = rows[0];

      if (!user.is_active) {
        return res.status(403).json({ message: 'Account is inactive' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isActive: user.is_active
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          id,
          email,
          first_name,
          last_name,
          role,
          is_active
        FROM users 
        WHERE id = ?
      `, [userId]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = rows[0];

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
