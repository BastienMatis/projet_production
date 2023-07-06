import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const connection = await DB.Connection;
      const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM users');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users.' });
    }
  };

  export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const connection = await DB.Connection;
      const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
      if (rows.length === 0) {
        res.status(404).json({ message: 'User not found.' });
      } else {
        res.json(rows[0]);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Error fetching user.' });
    }
  };

  export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { username, email } = req.body;
    console.log(req.body);
    try {
      const connection = await DB.Connection;
      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO users (username, email) VALUES (?, ?)',
        [username, email]
      );
      res.json({ id: result.insertId, username, email });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error creating user.' });
    }
  };
  
  export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { username, email } = req.body;
    try {
      const connection = await DB.Connection;
      const [result] = await connection.query<ResultSetHeader>(
        'UPDATE users SET username = ?, email = ? WHERE id = ?',
        [username, email, id]
      );
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'User not found.' });
      } else {
        res.json({ id: Number(id), username, email });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user.' });
    }
  };
  
  export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const connection = await DB.Connection;
      const [result] = await connection.query<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'User not found.' });
      } else {
        res.json({ message: 'User deleted successfully.' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user.' });
    }
  };