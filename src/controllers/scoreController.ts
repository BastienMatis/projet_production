import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';

export interface Score {
  id: number;
  studentId: number;
  challengeId: number;
}

export const createScore = async (studentId: number, challengeId: number): Promise<Score> => {
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO scores (studentId, challengeId) VALUES (?, ?)',
      [studentId, challengeId]
    );
    const insertedId = result.insertId;
    const score: Score = {
      id: insertedId,
      studentId,
      challengeId,
    };
    return score;
  } catch (error) {
    console.error('Error creating score in database.', error);
    throw error;
  }
};

export const getScoresByStudent = async (req: Request, res: Response): Promise<void> => {
  const { studentId } = req.params;
  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM scores WHERE studentId = ?',
      [studentId]
    );
    const scores: Score[] = rows.map((row: RowDataPacket) => ({
      id: row.id,
      studentId: row.studentId,
      challengeId: row.challengeId,
    }));
    res.json(scores);
  } catch (error) {
    console.error('Error retrieving scores from database.', error);
    res.status(500).json({ message: 'Error retrieving scores.' });
  }
};

export const deleteScore = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>('DELETE FROM scores WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Score not found.' });
    } else {
      res.json({ message: 'Score deleted successfully.' });
    }
  } catch (error) {
    console.error('Error deleting score from database.', error);
    res.status(500).json({ message: 'Error deleting score.' });
  }
};
