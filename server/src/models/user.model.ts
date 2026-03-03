import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
    id?: number;
    email: string;
    password?: string;
    role: 'admin' | 'student' | 'trainer';
    full_name?: string;
    is_active?: boolean;
    phone?: string;
    avatar?: string;
}

export class UserModel {
    static async findByEmail(email: string): Promise<User | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        return (rows.length > 0 ? rows[0] : null) as User | null;
    }

    static async findById(id: number): Promise<User | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        return (rows.length > 0 ? rows[0] : null) as User | null;
    }
}
