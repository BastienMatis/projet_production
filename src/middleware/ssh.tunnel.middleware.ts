import { Client } from "ssh2";
import { Response } from "express";

export const tunnelSSH = (sshClientConnection: Client, res: Response, hostIP: string, hostPort: number, functions: []) => {
    sshClientConnection.on('ready', () =>  {
        sshClientConnection.forwardOut(
            '127.0.0.1',
            3000,
            hostIP,
            hostPort,
            (err, stream) => {
              if (err) {
                console.error(err);
                res.status(500).send('Erreur du tunnel SSH');
                return;
              }
              
              // exécuter les fonctions ici

              stream.end();
            }
          );
    })
   
}