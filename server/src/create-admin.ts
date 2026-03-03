import { pool } from './config/database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const createAdmin = async () => {
    try {
        // Get inputs
        const email = await new Promise<string>(resolve => rl.question('Enter email: ', resolve));
        const password = await new Promise<string>(resolve => rl.question('Enter password: ', resolve));
        const fullName = await new Promise<string>(resolve => rl.question('Enter full name: ', resolve));

        rl.close();

        console.log(`\nCreating admin user: ${email}...`);

        // Hash password
        // const salt = await bcrypt.genSalt(10);
        // const hash = await bcrypt.hash(password, salt);

        // Check existing
        const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            console.error('❌ User with this email already exists!');
            process.exit(1);
        }

        // Insert
        await pool.query(
            `INSERT INTO users (email, password, role, full_name) 
       VALUES (?, ?, 'admin', ?)`,
            [email, password, fullName]
        );

        console.log('✅ Admin user created successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
};

createAdmin();
