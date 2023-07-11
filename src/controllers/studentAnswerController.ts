import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';

export interface StudentAnswer {
  userId: number;
  challengeQuestionId: number;
  response: string;
  isCorrect: boolean;
}

export const addStudentAnswer = async (req: Request, res: Response): Promise<void> => {
  const { userId, challengeQuestionId, response, isCorrect } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO student_answers (userId, challenge_questionId, response, is_correct) VALUES (?, ?, ?, ?)',
      [userId, challengeQuestionId, response, isCorrect]
    );
    const insertedId = result.insertId;
    const studentAnswer: StudentAnswer = {
      userId,
      challengeQuestionId,
      response,
      isCorrect,
    };
    res.json(studentAnswer);
  } catch (error) {
    console.error('Error adding student answer in database.', error);
    res.status(500).json({ message: 'Error adding student answer in database.' });
  }
};

export const getStudentAnswerById = async (req: Request, res: Response): Promise<void> => {
  const { userId, challengeQuestionId } = req.params;
  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM student_answers WHERE userId = ? AND challenge_questionId = ?',
      [userId, challengeQuestionId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: 'Student answer not found.' });
    } else {
      const studentAnswer: StudentAnswer = {
        userId: rows[0].userId,
        challengeQuestionId: rows[0].challenge_questionId,
        response: rows[0].response,
        isCorrect: rows[0].is_correct,
      };
      res.json(studentAnswer);
    }
  } catch (error) {
    console.error('Error retrieving student answer from database.', error);
    res.status(500).json({ message: 'Error retrieving student answer from database.' });
  }
};

export const deleteStudentAnswer = async (req: Request, res: Response): Promise<void> => {
  const { userId, challengeQuestionId } = req.params;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'DELETE FROM student_answers WHERE userId = ? AND challenge_questionId = ?',
      [userId, challengeQuestionId]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Student answer not found.' });
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    console.error('Error deleting student answer from database.', error);
    res.status(500).json({ message: 'Error deleting student answer from database.' });
  }
};
