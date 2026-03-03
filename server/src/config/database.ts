import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// export const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });


export const pool = mysql.createPool({
    host: "69.62.82.234",
    port: 3306,
    user: "remote_user",
    password: "@Codevocado#remote%1",
    database: "demo_lms",
    waitForConnections: true,
    connectionLimit: 6,
    queueLimit: 0,
    connectTimeout: 20000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
});


// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err);
    });
