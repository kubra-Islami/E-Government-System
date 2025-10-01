import dotenv from 'dotenv';
dotenv.config();

import {Pool} from "pg";

const pool = new Pool(
    process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL,  ssl: { rejectUnauthorized: false } }
        : {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
        }
);

export default pool;
