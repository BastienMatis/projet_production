import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';

export const loginAsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = await DB.Connection;
    const { username, password } = req.body; // Récupérer les valeurs d'email et de password à partir de la requête
    // Utilisation d'une requête préparée pour éviter les injections SQL
    const query = 'SELECT * FROM admins JOIN users ON users.id = admins.userId WHERE users.username = ? AND admins.password = ?';
    const row = await connection.query<RowDataPacket[]>(query, [username, password]);
    if (row.length > 0) {
      const user = row[0];
      console.log(user);
    } else {
      console.log("User not found");
    }
    res.json(row);
    console.log("Logged in");
  } catch (error) {
    console.error('Error logging as admin.', error);
    res.status(500).json({ message: 'Error logging as admin.' });
  }
};
