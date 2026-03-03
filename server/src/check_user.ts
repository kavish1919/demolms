import { pool } from './config/database';
import dotenv from 'dotenv';
dotenv.config();

const checkUser = async () => {
    try {
        const email = 'admin@codevocado.in';
        const [rows]: any = await pool.query('SELECT email, password, full_name FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            console.log('Email:', rows[0].email);
            console.log('Password in DB:', rows[0].password);
        } else {
            console.log('User not found');
        }
        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

checkUser();
