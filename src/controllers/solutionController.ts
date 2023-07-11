import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';

export interface Solution {
  id: number;
  command: string;
  expectedResponse: string;
  expectedError: string;
  challengeQuestionId: number;
}

export const createSolution = async (req: Request, res: Response): Promise<void> => {
  const { command, expectedResponse, expectedError, challengeQuestionId } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO solutions (command, expectedResponse, expectedError, challenge_questionId) VALUES (?, ?, ?, ?)',
      [command, expectedResponse, expectedError, challengeQuestionId]
    );
    const insertedId = result.insertId;
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM solutions WHERE id = ?', [insertedId]);
    if (rows.length === 0) {
      throw new Error('Solution not found after insertion.');
    }
    const solution: Solution = {
      id: rows[0].id,
      command: rows[0].command,
      expectedResponse: rows[0].expectedResponse,
      expectedError: rows[0].expectedError,
      challengeQuestionId: rows[0].challenge_questionId,
    };
    res.json(solution);
  } catch (error) {
    console.error('Error creating solution in database.', error);
    res.status(500).json({ message: 'Error creating solution in database.' });
  }
};

export const getSolutionById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM solutions WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Solution not found.' });
    } else {
      const solution: Solution = {
        id: rows[0].id,
        command: rows[0].command,
        expectedResponse: rows[0].expectedResponse,
        expectedError: rows[0].expectedError,
        challengeQuestionId: rows[0].challenge_questionId,
      };
      res.json(solution);
    }
  } catch (error) {
    console.error('Error retrieving solution from database.', error);
    res.status(500).json({ message: 'Error retrieving solution from database.' });
  }
};

export const updateSolution = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { command, expectedResponse, expectedError, challengeQuestionId } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'UPDATE solutions SET command = ?, expectedResponse = ?, expectedError = ?, challenge_questionId = ? WHERE id = ?',
      [command, expectedResponse, expectedError, challengeQuestionId, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Solution not found.' });
    } else {
      const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM solutions WHERE id = ?', [id]);
      if (rows.length === 0) {
        throw new Error('Solution not found after update.');
      }
      const solution: Solution = {
        id: rows[0].id,
        command: rows[0].command,
        expectedResponse: rows[0].expectedResponse,
        expectedError: rows[0].expectedError,
        challengeQuestionId: rows[0].challenge_questionId,
      };
      res.json(solution);
    }
  } catch (error) {
    console.error('Error updating solution in database.', error);
    res.status(500).json({ message: 'Error updating solution in database.' });
  }
};

export const deleteSolution = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>('DELETE FROM solutions WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Solution not found.' });
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    console.error('Error deleting solution from database.', error);
    res.status(500).json({ message: 'Error deleting solution from database.' });
  }
};

export const getSolutionByQuestionIds = async (req: Request, res: Response): Promise<void> => {
  const questionIds = req.params.questionIds.split(',');
  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM solutions WHERE challenge_questionId IN (?)',
      [questionIds]
    );
    const solutions: Solution[] = rows.map((row: RowDataPacket) => ({
      id: row.id,
      command: row.command,
      expectedResponse: row.expectedResponse,
      expectedError: row.expectedError,
      challengeQuestionId: row.challenge_questionId,
    }));
    res.json(solutions);
  } catch (error) {
    console.error('Error retrieving solutions from database.', error);
    res.status(500).json({ message: 'Error retrieving solutions.' });
  }
};

