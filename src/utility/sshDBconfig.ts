import { Client as SSHClient, ConnectConfig } from 'ssh2';
import { Client as PGClient } from 'pg';
import { getStudentConnection } from '../controllers/studentConnectionController';
import * as fs from 'fs';
require('dotenv').config();



export async function connectToStudentDatabase(studentId: number) {
  try {
    const studentConnection = await getStudentConnection(studentId);

    if (studentConnection) {
      const tunnelConfig: ConnectConfig = {
        host: studentConnection.sshHost,
        port: 22,
        username: studentConnection.sshName,
        privateKey: fs.readFileSync('/home/dev/secrets/signing/signing.key', 'utf8')
      };

      const forwardConfig = {
        srcHost: '127.0.0.1',
        srcPort: 3306, // Port PostgreSQL par défaut
        dstHost: studentConnection.dbHost, // Adresse IP ou nom d'hôte de la base de données de l'étudiant
        dstPort: studentConnection.dbPort // Port de la base de données de l'étudiant
      };

      const sshClient = new SSHClient();
      const SSHConnection = new Promise<PGClient>((resolve, reject) => {
        sshClient.on('ready', () => {
          sshClient.forwardOut(
            forwardConfig.srcHost,
            forwardConfig.srcPort,
            forwardConfig.dstHost,
            forwardConfig.dstPort,
            (err, stream) => {
              if (err) {
                reject(err);
                return;
              }

              const pgClient = new PGClient({
                host: studentConnection.dbHost,
                port: studentConnection.dbPort,
                user: studentConnection.dbUserName,
                password: studentConnection.dbPassword,
                database: studentConnection.dbName
              });

              pgClient.connect((error) => {
                if (error) {
                  reject(error);
                  return;
                }

                resolve(pgClient);
              });
            }
          );
        }).on('error', (err) => {
          reject(err);
        }).connect(tunnelConfig);
      });

      try {
        const dbConnection = await SSHConnection;
        // Effectuez les opérations avec la base de données PostgreSQL à travers le tunnel SSH
        // ...
        dbConnection.end();
      } catch (error) {
        console.error('Erreur lors de la connexion via le tunnel SSH', error);
        // Gérer l'erreur appropriée
      }
    } else {
      console.error('Aucune connexion d\'étudiant trouvée');
      // Gérer l'erreur appropriée
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la connexion de l\'étudiant', error);
    // Gérer l'erreur appropriée
  }
}
