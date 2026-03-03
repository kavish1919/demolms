import { pool } from './config/database';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const inspect = async () => {
    try {
        const [rows]: any = await pool.query("SHOW COLUMNS FROM users");
        const columns = rows.map((r: any) => r.Field).join(', ');
        fs.writeFileSync(path.join(__dirname, 'schema.txt'), columns);
        console.log('Schema written to schema.txt');
        process.exit(0);
    } catch (error) {
        console.error('Inspect failed:', error);
        process.exit(1);
    }
};

inspect();
