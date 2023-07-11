import { Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2/promise';
import { DB } from '../utility/DB';

export const addStudentToClass = async (req: Request, res: Response): Promise<void> => {
  const { userId, classId } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>('INSERT INTO student_class (userId, classId) VALUES (?, ?)', [userId, classId]);
    const insertedId = result.insertId;
    res.json({ id: insertedId, userId, classId });
  } catch (error) {
    console.error('Error adding student to class in database.', error);
    res.status(500).json({ message: 'Error adding student to class.' });
  }
};

export const removeStudentFromClass = async (req: Request, res: Response): Promise<void> => {
  const { userId, classId } = req.params;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>('DELETE FROM student_class WHERE userId = ? AND classId = ?', [userId, classId]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Student or class not found.' });
    } else {
      res.json({ message: 'Student removed from class successfully.' });
    }
  } catch (error) {
    console.error('Error removing student from class in database.', error);
    res.status(500).json({ message: 'Error removing student from class.' });
  }
};
