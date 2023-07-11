import { Request, Response } from 'express';

import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';
import { Crud } from "../utility/Crud";
import { ApiError } from '../utility/Error/ApiError';
import { ErrorCode } from '../utility/Error/ErrorCode'
import { UserCreateValidator } from '../model/User/users.validator'

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const connection = await DB.Connection;
      const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM users');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users.' });
    }
  };

  export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const connection = await DB.Connection;
      const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
      if (rows.length === 0) {
        res.status(404).json({ message: 'User not found.' });
      } else {
        res.json(rows[0]);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Error fetching user.' });
    }
  };

  export const createUser = async (req: Request, res: Response): Promise<void> => {
    const user = req.body;
    console.log(req.body);
    try {
      if (!UserCreateValidator(user)) {
        throw new ApiError(ErrorCode.BadRequest, 'validation/failed', 'Data did not pass validation', UserCreateValidator.errors);      
      }

      const result = await Crud.Create({
        body: user, 
        table: 'users'
      });

      res.json(result);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error creating user.' });
    }
  };
  
  export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const update = req.body;
    try {
      if (!UserCreateValidator(update)) {
        throw new ApiError(ErrorCode.BadRequest, 'validation/failed', 'Data did not pass validation', UserCreateValidator.errors);      
      }

      const result = await Crud.Update({
        body: update,
        table: 'users',
        idKey: 'id',
        idValue: id
      });

      res.json(result);

    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user.' });
    }
  };
  
  export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const connection = await DB.Connection;
      const [result] = await connection.query<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'User not found.' });
      } else {
        res.json({ message: 'User deleted successfully.' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user.' });
    }
  };
