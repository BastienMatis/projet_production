import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';

export interface ClassChallenge {
  classId: number;
  challengeId: number;
}

export const addClassChallenge = async (req: Request, res: Response): Promise<void> => {
  const { classId, challengeId } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO class_challenges (classId, challengeId) VALUES (?, ?)',
      [classId, challengeId]
    );
    const insertedId = result.insertId;
    const classChallenge: ClassChallenge = {
      classId,
      challengeId,
    };
    res.json(classChallenge);
  } catch (error) {
    console.error('Error adding class challenge in database.', error);
    res.status(500).json({ message: 'Error adding class challenge in database.' });
  }
};

export const getClassChallengeById = async (req: Request, res: Response): Promise<void> => {
  const { classId, challengeId } = req.params;
  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM class_challenges WHERE classId = ? AND challengeId = ?',
      [classId, challengeId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: 'Class challenge not found.' });
    } else {
      const classChallenge: ClassChallenge = {
        classId: rows[0].classId,
        challengeId: rows[0].challengeId,
      };
      res.json(classChallenge);
    }
  } catch (error) {
    console.error('Error retrieving class challenge from database.', error);
    res.status(500).json({ message: 'Error retrieving class challenge from database.' });
  }
};

export const deleteClassChallenge = async (req: Request, res: Response): Promise<void> => {
  const { classId, challengeId } = req.params;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'DELETE FROM class_challenges WHERE classId = ? AND challengeId = ?',
      [classId, challengeId]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Class challenge not found.' });
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    console.error('Error deleting class challenge from database.', error);
    res.status(500).json({ message: 'Error deleting class challenge from database.' });
  }
};
