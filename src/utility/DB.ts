import mysql, { Pool, RowDataPacket, FieldPacket } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export class DB {
  private static POOL: Pool;

  static async initialize(): Promise<void> {
    if (!this.POOL) {
      this.POOL = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
      });
    }

    try {
      const connection = await this.POOL.getConnection();
      await connection.ping();
      connection.release();
      console.log('Database connection established.');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      process.exit(1);
    }
  }

  static get Connection(): Promise<Pool> {
    if (!this.POOL) {
      console.error('Database connection not established.');
    }
    return Promise.resolve(this.POOL);
  }
}