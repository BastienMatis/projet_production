import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import { Client as SSHClient, ConnectConfig } from 'ssh2';
import { Client as PGClient } from 'pg';
import { getStudentConnection } from '../controllers/studentConnectionController';
import * as fs from 'fs';

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
    let status = 'OK';
    let message = 'Message';
    let allSolutionsCorrect = true;

    const responses: any[] = [];

    const studentId = 1; // TODO: Remplacer par l'ID de l'étudiant connecté

    try {
      const studentConnection = await getStudentConnection(studentId);

      if (studentConnection) {
        const tunnelConfig: ConnectConfig = {
          host: studentConnection.sshHost,
          port: 22,
          username: studentConnection.sshName,
          privateKey: fs.readFileSync('/home/dev/secrets/signing/signing.key', 'utf8')
        };

        const forwardConfig = {
          srcHost: '127.0.0.1',
          srcPort: 5432, // Port PostgreSQL par défaut
          dstHost: studentConnection.dbHost, // Adresse IP ou nom d'hôte de la base de données de l'étudiant
          dstPort: studentConnection.dbPort // Port de la base de données de l'étudiant
        };

        const sshClient = new SSHClient();

        console.log('Tentative de connexion SSH avec les paramètres suivants :');
        console.log('Hôte :', tunnelConfig.host);
        console.log('Port :', tunnelConfig.port);
        console.log('Utilisateur :', tunnelConfig.username);

        const SSHConnection = new Promise<PGClient>((resolve, reject) => {
          sshClient.on('ready', async () => {
            console.log('Connexion SSH établie avec succès.');
        
            try {
              const sshExec = promisify(sshClient.exec.bind(sshClient));
        
              for (let i = 0; i < solutionCommands.length; i++) {
                const questionNumber = firstQuestionNumber + i;
                const { command, questionId, expectedResponse } = solutionCommands[i];

                console.log(i, solutionCommands.length)
        
                console.log(`Exécution de la commande "${command}"`);
        
                const { stdout, stderr } = await sshExec(command);
        
                let output = '';
                let hasStderr = false; // Variable pour suivre si stderr a été traité
        
                stdout.on('data', (data: Buffer) => {
                  output += data.toString();
                });
        
                stdout.on('close', () => {
                  console.log('Sortie de la commande :', output.trim());
                  // Utilisez la valeur de la sortie de la commande ici
                  if (!hasStderr) {
                    if (output.trim() !== expectedResponse) {
                      console.log("output mauvaise réponse: ", output)
                      lastQuestionId = questionId;
                      status = 'Mauvaise réponse';
                      message = output;
                      allSolutionsCorrect = false;
                      responses.push({ lastQuestionId, status, message, error: true });
                    } else {
                      lastQuestionId = questionId;
                      status = 'OK';
                      message = output;
                      responses.push({ lastQuestionId, status, message, error: false });
                    }
                    if (i === solutionCommands.length - 1) {
                      // Dernière question, envoyer la réponse finale
                      const responsesObj = Object.assign({}, responses);
                      console.log(responsesObj);
                      res.json(responsesObj);
                    }
                  }
                });
        
                stderr.on('data', (data: Buffer) => {
                  output += data.toString();
                  hasStderr = true; // Marquer que stderr a été traité
                });
        
                stderr.on('close', () => {
                  console.log("Sortie de l'erreur : ", output.trim());
                  // Utilisez la valeur de la sortie de l'erreur ici
                  if (hasStderr && output.trim().length > 0) {
                    lastQuestionId = questionId;
                    status = 'Erreur commande';
                    message = output;
                    allSolutionsCorrect = false;
                    responses.push({ lastQuestionId, status, message, error: true });
                  }
                  if (hasStderr && i === solutionCommands.length - 1) {
                    // Dernière question, envoyer la réponse finale
                    const responsesObj = Object.assign({}, responses);
                    console.log(responsesObj);
                    res.json(responsesObj);
                  }

                });
              }
        
              // Fermer la connexion SSH après exécution des commandes
              sshClient.end();
        
            } catch (error: any) {
              console.error(`Erreur lors de l'exécution de la commande :`, error);
              lastQuestionId = null;
              status = 'Erreur commande';
              message = error.message;
              allSolutionsCorrect = false;
              responses.push({ lastQuestionId, status, message, error: true });
        
              const responsesObj = Object.assign({}, responses);
              res.json(responsesObj);
            }
          }).on('error', (err) => {
            console.error('Erreur lors de la connexion SSH :', err);
            reject(err);
          }).connect(tunnelConfig);
        });
        

        try {
          const dbConnection = await SSHConnection;

          // ...
          dbConnection.end();
        } catch (error) {
          console.error('Erreur lors de la connexion via le tunnel SSH', error);
          res.status(500).json({ message: 'Erreur lors de la connexion via le tunnel SSH' });
        }
      } else {
        console.error('Aucune connexion d\'étudiant trouvée');
        res.status(500).json({ message: 'Aucune connexion d\'étudiant trouvée' });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la connexion de l\'étudiant', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de la connexion de l\'étudiant' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution du test de défi :', error);
    res.status(500).json({ message: 'Erreur lors de l\'exécution du test de défi.' });
  }
};