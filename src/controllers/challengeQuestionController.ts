import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';

export interface ChallengeQuestion {
  id: number;
  title: string;
  description: string;
  questionNumber: number;
  questionValue: number;
  challengeId: number;
}

export const getAllChallengeQuestions = async (req: Request, res: Response): Promise<void> => {
  const { challengeId } = req.params;
  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM challenge_questions WHERE challengeId = ?', [challengeId]);
    const challengeQuestions: ChallengeQuestion[] = rows.map((row: RowDataPacket) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      questionNumber: row.questionNumber,
      questionValue: row.questionValue,
      challengeId: row.challengeId,
    }));
    res.json(challengeQuestions);
  } catch (error) {
    console.error('Error retrieving challenge questions from database.', error);
    res.status(500).json({ message: 'Error retrieving challenge questions.' });
  }
};

export const createChallengeQuestion = async (req: Request, res: Response): Promise<void> => {
  const { title, description, questionNumber, questionValue, challengeId } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO challenge_questions (title, description, questionNumber, questionValue, challengeId) VALUES (?, ?, ?, ?, ?)',
      [title, description, questionNumber, questionValue, challengeId]
    );
    const insertedId = result.insertId;
    res.json({ id: insertedId, title, description, questionNumber, questionValue, challengeId });
  } catch (error) {
    console.error('Error creating challenge question in database.', error);
    res.status(500).json({ message: 'Error creating challenge question.' });
  }
};

export const updateChallengeQuestion = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, questionNumber, questionValue, challengeId } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'UPDATE challenge_questions SET title = ?, description = ?, questionNumber = ?, questionValue = ?, challengeId = ? WHERE id = ?',
      [title, description, questionNumber, questionValue, challengeId, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Challenge question not found.' });
    } else {
      res.json({ id: Number(id), title, description, questionNumber, questionValue, challengeId });
    }
  } catch (error) {
    console.error('Error updating challenge question in database.', error);
    res.status(500).json({ message: 'Error updating challenge question.' });
  }
};

export const deleteChallengeQuestion = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>('DELETE FROM challenge_questions WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Challenge question not found.' });
    } else {
      res.json({ message: 'Challenge question deleted successfully.' });
    }
  } catch (error) {
    console.error('Error deleting challenge question from database.', error);
    res.status(500).json({ message: 'Error deleting challenge question.' });
  }
};
