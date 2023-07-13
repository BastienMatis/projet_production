import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';
import { StudentConnection } from '../types/DBConnection';

export const insertStudentDBInfo = async (req: Request, res: Response): Promise<void> => {
  const { sshHost, sshName, dbHost, dbPort, dbUserName, dbPassword, dbName, userId, challengeId } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO student_connections (sshHost, sshName, dbHost, dbPort, dbUserName, dbPassword, dbName, userId, challengeId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [sshHost, sshName, dbHost, dbPort, dbUserName, dbPassword, dbName, userId, challengeId]
    );
    const insertedId = result.insertId;
    // Envoyer la réponse JSON appropriée si nécessaire
    res.json({ message: 'Informations de connexion étudiant ajoutées avec succès.' });
  } catch (error) {
    console.log('Error connecting to student in database.', error);
    res.status(500).json({message: "Error"})
  }
};


export const getStudentConnection = async (userId: number | null): Promise<StudentConnection | undefined> => {
  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM student_connections WHERE userId = ?', [userId]);
    const studentConnection = rows[0]; // Prendre uniquement la première connexion trouvée
    if (studentConnection) {
      return {
        sshHost: studentConnection.sshHost,
        sshName: studentConnection.sshName,
        dbHost: studentConnection.dbHost,
        dbPort: studentConnection.dbPort,
        dbUserName: studentConnection.dbUserName,
        dbPassword: studentConnection.dbPassword,
        dbName: studentConnection.dbName
      };
    } else {
      return undefined; // Aucune connexion trouvée pour cet utilisateur
    }
  } catch (error) {
    console.error('Error retrieving student connections from database.', error);
  }
};

export const getStudentConnectionByUserId = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.userId;
  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM student_connections WHERE userId = ?', [userId]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Student connection not found.' });
    } else {
      console.log(rows)
      const studentConnection: StudentConnection = {
        sshHost: rows[0].sshHost,
        sshName: rows[0].sshName,
        dbHost: rows[0].dbHost,
        dbPort: rows[0].dbPort,
        dbUserName: rows[0].dbUserName,
        dbPassword: rows[0].dbPassword,
        dbName: rows[0].dbName,
      };
      res.json(studentConnection);
    }
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
