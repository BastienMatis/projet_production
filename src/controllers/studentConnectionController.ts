import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';
import { StudentDBConnection } from '../types/DBConnection';

export const connectToStudentDB = async (req: Request, res: Response): Promise<void> => {
  const { dbUserName, password, dbName, userId, challengeId } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'UPDATE student_connections SET dbUserName ?, password ?, dbName ?, challengeId ? WHERE userId = ? AND challengeId = ?',
      [dbUserName, password, dbName, challengeId]
    );
    const insertedId = result.insertId;
    res.json({
      id: insertedId,
      dbUserName,
      password,
      dbName,
      userId,
      challengeId,
    });
  } catch (error) {
    console.error('Error connecting to student in database.', error);
    res.status(500).json({ message: 'Error connecting to student.' });
  }
};

export const getStudentConnections = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM student_connections WHERE userId = ?', [userId]);
    const studentConnections: StudentDBConnection[] = rows.map((row: RowDataPacket) => ({
      dbUserName: row.dbUserName,
      password: row.password,
      dbName: row.dbName,
      userId: row.userId,
      challengeId: row.challengeId,
    }));
    res.json(studentConnections);
  } catch (error) {
    console.error('Error retrieving student connections from database.', error);
    res.status(500).json({ message: 'Error retrieving student connections.' });
  }
};

export const deleteStudentConnection = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>('DELETE FROM student_connections WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Student connection not found.' });
    } else {
      res.json({ message: 'Student connection deleted successfully.' });
    }
  } catch (error) {
    console.error('Error deleting student connection from database.', error);
    res.status(500).json({ message: 'Error deleting student connection.' });
  }
};
