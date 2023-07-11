import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2/promise";
import { DB } from "../utility/DB";

import { Client, ExecOptions, ShellOptions } from "ssh2";
import * as fs from "fs";
import * as path from "path";
import { ConnectionInfo, SSHConnection } from "../types/ssh/connection";

export const insertSSHInfo = async (req: Request, res: Response): Promise<void> => {
  const { sshHost, sshUsername } = req.body;
  try {
    const connection = await DB.Connection;

    const [result] = await connection.query<ResultSetHeader>(
      "INSERT INTO student_connections (sshHost, sshName) VALUES (?, ?)",
      [sshHost, sshUsername]
    );
  } catch (error) {
    res.status(500).json({ message: 'Error adding student answer in database.' });
  }
};


export default SSHConnection;
