import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2/promise";
import { DB } from "../utility/DB";
import { SSHConnection } from "../types/ssh/connection";
import { StudentSSHConnection } from "../types/DBConnection";

export const insertSSHInfo = async (req: Request, res: Response): Promise<void> => {
  const { sshHost, sshName } = req.body;
  try {
    const connection = await DB.Connection;

    const [result] = await connection.query<ResultSetHeader>(
      "INSERT INTO student_connections (sshHost, sshName) VALUES (?, ?)",
      [sshHost, sshName]
    );
    const studentConnection: StudentSSHConnection = {
      sshHost,
      sshName
    };
  } catch (error) {
    //res.status(500).json({ message: 'Error adding student answer in database.' });
  }
};


export default SSHConnection;
