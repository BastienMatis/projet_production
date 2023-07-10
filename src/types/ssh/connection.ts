import { Response } from 'express';

export interface ConnectionInfo {
    host: string,
    port: number,
    username: string,
    privateKeyPath: string
}

export interface SSHConnection {
    connect: (connectionInfo: ConnectionInfo, res: Response) => void;
    disconnect: () => void;
}