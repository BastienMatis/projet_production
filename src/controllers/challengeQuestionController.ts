import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

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

const exec = promisify(execCallback);

export const runChallengeTest = async (req: Request, res: Response): Promise<void> => {
  const { challengeId } = req.params;
  const { solutionCommands } = req.body;

  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM challenge_questions WHERE challengeId = ? ORDER BY questionNumber ASC',
      [challengeId]
    );
    const firstQuestionNumber = rows[0].questionNumber;

    let lastQuestionId = null;
    let status = "OK";
    let message = '';
    let allSolutionsCorrect = true;

    const responses: any[] = [];

    for (let i = 0; i < solutionCommands.length; i++) {
      const questionNumber = firstQuestionNumber + i;
      const { command, questionId, expectedResponse } = solutionCommands[i];

      try {
        const { stdout, stderr } = await exec(command);

        if (stdout.trim() !== expectedResponse) {
          lastQuestionId = questionId;
          status = "Mauvaise réponse";
          message = stdout;
          allSolutionsCorrect = false;
          responses.push({ lastQuestionId, status, message, error: true });
        } else {
          lastQuestionId = questionId;
          status = "OK";
          message = stdout;
          responses.push({ lastQuestionId, status, message, error: false });
        }

        if (stderr) {
          lastQuestionId = questionId;
          status = "Erreur commande";
          message = stderr;
          allSolutionsCorrect = false;
          responses.push({ lastQuestionId, status, message, error: true });
        }

        if (i < solutionCommands.length - 1) {
          const nextQuestionId = solutionCommands[i + 1].questionId;
          lastQuestionId = nextQuestionId;
          status = "OK";
          message = '';
        }
      } catch (error: any) {
        console.error(`Erreur lors de l'exécution de la commande`);
        lastQuestionId = questionId;
        status = "Erreur commande";
        message = error.message;
        allSolutionsCorrect = false;
        responses.push({ lastQuestionId, status, message, error: true });
      }
    }

    const responsesObj = Object.assign({}, responses);
    res.json(responsesObj);
  } catch (error) {
    console.error('Error running challenge test:', error);
    res.status(500).json({ message: 'Error running challenge test.' });
  }
};
