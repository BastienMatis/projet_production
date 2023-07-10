import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';

export interface Challenge {
  id: number;
  name: string;
}

export const getAllChallenges = async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM challenges');
    const challenges: Challenge[] = rows.map((row: RowDataPacket) => ({
      id: row.id,
      name: row.name,
    }));
    res.json(challenges);
  } catch (error) {
    console.error('Error retrieving challenges from database.', error);
    res.status(500).json({ message: 'Error retrieving challenges.' });
  }
};

export const createChallenge = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO challenges (name) VALUES (?)',
      [name]
    );
    const insertedChallengeId = result.insertId;
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM challenges WHERE id = ?', [insertedChallengeId]);
    if (rows.length === 0) {
      throw new Error('Challenge not found after insertion.');
    }
    const challenge: Challenge = {
      id: rows[0].id,
      name: rows[0].name,
    };
    res.json(challenge);
  } catch (error) {
    console.error('Error creating challenge in database.', error);
    res.status(500).json({ message: 'Error creating challenge.' });
  }
};

export const updateChallenge = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'UPDATE challenges SET name = ? WHERE id = ?',
      [name, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Challenge not found.' });
    } else {
      res.json({ id: Number(id), name });
    }
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ message: 'Error updating challenge.' });
  }
};

export const deleteChallenge = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>('DELETE FROM challenges WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Challenge not found.' });
    } else {
      res.json({ message: 'Challenge deleted successfully.' });
    }
  } catch (error) {
    console.error('Error deleting challenge from database.', error);
    res.status(500).json({ message: 'Error deleting challenge.' });
  }
};
