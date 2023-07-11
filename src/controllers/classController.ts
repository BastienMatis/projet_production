import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';

export interface Class {
  id: number;
  name: string;
}

export const getAllClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = await DB.Connection;
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM class');
    const classes: Class[] = rows.map((row: RowDataPacket) => ({
      id: row.id,
      name: row.name,
    }));
    res.json(classes);
  } catch (error) {
    console.error('Error retrieving classes from database.', error);
    res.status(500).json({ message: 'Error retrieving classes.' });
  }
};

export const createClass = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>('INSERT INTO class (name) VALUES (?)', [name]);
    const insertedClassId = result.insertId;
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM class WHERE id = ?', [insertedClassId]);
    if (rows.length === 0) {
      throw new Error('Class not found after insertion.');
    }
    const classObj: Class = {
      id: rows[0].id,
      name: rows[0].name,
    };
    res.json(classObj);
  } catch (error) {
    console.error('Error creating class in database.', error);
    res.status(500).json({ message: 'Error creating class.' });
  }
};

export const updateClass = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>('UPDATE class SET name = ? WHERE id = ?', [name, id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Class not found.' });
    } else {
      res.json({ id: Number(id), name });
    }
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ message: 'Error updating class.' });
  }
};

export const deleteClass = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const connection = await DB.Connection;
    const [result] = await connection.query<ResultSetHeader>('DELETE FROM class WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Class not found.' });
    } else {
      res.json({ message: 'Class deleted successfully.' });
    }
  } catch (error) {
    console.error('Error deleting class from database.', error);
    res.status(500).json({ message: 'Error deleting class.' });
  }
};
