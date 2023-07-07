import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';

const { Client } = require('ssh2');
const path = require('path');

export const connectToStudent = async (req: Request, res: Response): Promise<void> => {
    console.log("Connecting...");
    const conn = new Client();

    const { host, username } = req.body;

    conn.on('ready', () => {
        console.log('Connexion SSH établie avec succès');

        // conn.exec('votre_commande_ssh', (err, stream) => {
        //     if (err) {
        //         console.error('Erreur lors de l\'exécution de la commande SSH:', err);
        //         conn.end();
        //         return;
        //     }

        //     stream.on('close', (code, signal) => {
        //         console.log('Commande terminée avec le code', code);
        //         conn.end();
        //     }).on('data', (data) => {
        //         console.log('Sortie de la commande SSH:', data.toString());
        //     });
        // });
    });

    conn.on('error', (err: any) => {
        console.error('Erreur lors de la connexion SSH', err);
    });

    console.log({
        host: host,
        port: 22,
        username: username,
        privateKey: require('fs').readFileSync('/home/dev/secrets/signing/signing.key')
    });
    conn.connect({
        host: host,
        port: 22,
        username: username,
        privateKey: require('fs').readFileSync('/home/dev/secrets/signing/signing.key')
    });
    res.status(200).json({ message: 'Connected in SSH.' });
}