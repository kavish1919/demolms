import { pool } from './config/database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
    try {
        console.log('Starting seed process...');

        // 1. Check if admin exists
        const [users]: any = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            ['admin@codevocado.in']
        );

        // const passwordHash = await bcrypt.hash('password123', 10);
        const passwordPlain = 'password123';

        if (users.length === 0) {
            console.log('Creating admin user...');
            await pool.query(
                `INSERT INTO users (full_name, email, password, role, is_active) 
                 VALUES (?, ?, ?, ?, ?)`,
                ['Super Admin', 'admin@codevocado.in', passwordPlain, 'admin', true]
            );
            console.log('✅ Admin user created');
        } else {
            console.log('Updating admin user...');
            await pool.query(
                'UPDATE users SET password = ?, full_name = ?, role = ? WHERE email = ?',
                [passwordPlain, 'Super Admin', 'admin', 'admin@codevocado.in']
            );
            console.log('✅ Admin user updated');
        }

        console.log('Seed completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seed();
