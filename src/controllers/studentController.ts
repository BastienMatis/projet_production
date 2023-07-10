import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';

export interface Student {
  id: number;
  userId: number;
  studentFirstName: string;
  studentLastName: string;
}

export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM students');
    const students: Student[] = rows.map((row: RowDataPacket) => ({
      id: row.id,
      userId: row.userId,
      studentFirstName: row.studentFirstName,
      studentLastName: row.studentLastName,
    }));
    res.json(students);
  } catch (error) {
    console.error('Error retrieving students from database.', error);
    res.status(500).json({ message: 'Error retrieving students.' });
  }
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  const { userId, studentFirstName, studentLastName } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO students (userId, studentFirstName, studentLastName) VALUES (?, ?, ?)',
      [userId, studentFirstName, studentLastName]
    );
    const insertedStudentId = result.insertId;
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM students WHERE userId = ?', [userId]);
    if (rows.length === 0) {
      throw new Error('Student not found after insertion.');
    }
    const student: Student = {
      id: rows[0].userId,
      userId: rows[0].userId,
      studentFirstName: rows[0].studentFirstName,
      studentLastName: rows[0].studentLastName,
    };
    res.json(student);
  } catch (error) {
    console.error('Error creating student in database.', error);
    res.status(500).json({ message: 'Error creating student.' });
  }
};



export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userId, studentFirstName, studentLastName } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>(
      'UPDATE students SET userId = ?, studentFirstName = ?, studentLastName = ? WHERE id = ?',
      [userId, studentFirstName, studentLastName, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Student not found.' });
    } else {
      res.json({ id: Number(id), userId, studentFirstName, studentLastName });
    }
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Error updating student.' });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>('DELETE FROM students WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Student not found.' });
    } else {
      res.json({ message: 'Student deleted successfully.' });
    }
  } catch (error) {
    console.error('Error deleting student from database.', error);
    res.status(500).json({ message: 'Error deleting student.' });
  }
};
