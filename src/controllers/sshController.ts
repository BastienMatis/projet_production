import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { DB } from "../utility/DB";

import { Client, ExecOptions, ShellOptions } from "ssh2";
import * as fs from "fs";
import * as path from "path";
import { ConnectionInfo, SSHConnection } from "../types/ssh/connection";

export class SSHClient implements SSHConnection {
  private conn: Client;

  constructor() {
    this.conn = new Client();
  }

  public async connect(
    { host, port, username, privateKeyPath }: ConnectionInfo,
    res: Response
  ): Promise<void> {
    this.conn.on("ready", () => {
      console.log("Connexion SSH établie avec succès");
      const absolutePath = path.resolve(__dirname, privateKeyPath);

      this.conn.connect({
        host: host,
        port: port,
        username: username,
        privateKey: fs.readFileSync(absolutePath),
      });
    });
    const connection = await DB.Connection;

    const [result] = await connection.query<ResultSetHeader>(
      "INSERT INTO student_connections (connectionIp, connectionport, connectionName) VALUES (?, ?, ?)",
      [host, port, username]
    );
    res.status(200).json({ message: "Connected in SSH." });

    this.conn.on("error", (err: any) => {
      console.error("Erreur lors de la connexion SSH", err);
    });
  }

  public disconnect(): void {
    this.conn.end();
  }
}

// A répéter dans toutes les fonctions qui doivent lancer des commandes
// const sshClient = new SSHClient();

// sshClient.connect('unixshell.hetic.glassworks.tech', 22, 'identifiant', '../secrets/signing');

// ...
// Effectuez d'autres opérations, traitements ou commandes SSH ici
// ...

//sshClient.disconnect();

export default SSHConnection;
