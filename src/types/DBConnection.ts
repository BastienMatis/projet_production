export interface StudentConnection {
    sshHost: string,
    sshName: string,
    dbHost: string;
    dbPort: number;
    dbUserName: string;
    dbPassword: string;
    dbName: string;
}
export interface StudentDBConnection {
  dbHost: string;
  dbPort: number;
  dbUserName: string;
  dbPassword: string;
  dbName: string;
  }