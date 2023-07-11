import { Request, Response } from 'express';
import { IUserRO } from "../model/User/IUser";
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';
import { Email } from "../utility/Email";
import { ApiError } from "../utility/Error/ApiError";
import { ErrorCode } from "../utility/Error/ErrorCode";
import { JWT } from "../utility/JWT";
import { IAccessToken } from "../types/auth/IAccessToken";
import { Crud } from "../utility/Crud";

export const ISSUER = "api-auth";
export const MAGIC_AUD = "api-magic"
export const ACCESS_AUD = "api-access";
export const RENEW_AUD = "api-renew";

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
}


export const magic = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const email = req.query.email;
      if (!email) {
        throw new ApiError(ErrorCode.BadRequest, 'auth/missing-email', "Email is missing in magic link request.");
      }
  
      const user = await Crud.Read<IUserRO>({
        table: 'users',
        idKey: 'email',
        idValue: email.toString(),
        columns: ['id', 'email']
      });
  
      const jwt = new JWT();
      const encoded = await jwt.create(
        {
          id: user.id,
        },
        {
          expiresIn: '30 minutes',
          audience: MAGIC_AUD,
          issuer: ISSUER,
        }
      ) as string;
  
      const emailer = new Email();
  
      const link = (process.env.FRONT_URL || `http://localhost:${process.env.PORT}`) + '/auth/login?jwt=' + encodeURIComponent(encoded);
      await emailer.sendMagicLink(email.toString(), link, 'Mon service');
  
      res.json({
        ok: true
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users.' });
    }
  };


  export const login = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
        if (!req.query.jwt) {
            throw new ApiError(ErrorCode.BadRequest, 'auth/missing-magic-link-token', "Token is missing in login request.");
    }

    const jwt = new JWT();
    const decoded = await jwt.decode(req.query.jwt.toString(), {
      issuer: ISSUER,
      audience: MAGIC_AUD,
    });

    if (!decoded.id) {
        throw new ApiError(ErrorCode.Unauthorized, 'auth/invalid-magic-link-token', "userId was not found in the payload for token");
      }

    const user = await Crud.Read<IUserRO>({
    table: 'users',
    idKey: 'id',
    idValue: decoded.id,
    columns: ['id']
    }); 
    
    let payload: IAccessToken = {
        id: user.id
      };

      const access = await jwt.create(payload, {
        expiresIn: '12 hours',
        issuer: ISSUER,
        audience: ACCESS_AUD,
      });
  
      const renew = await jwt.create(payload, {
        expiresIn: '1 week',
        issuer: ISSUER,
        audience: RENEW_AUD,
      });
  
      res.json({
        access: access,
        renew: renew,
        redirectTo: 'https://lien.vers.mon.front',
        message: 'Normalement ce endpoint va demander au navigateur de rediriger vers votre site ou ressource'
      });  
    } catch (error) {
        console.error('Error logging.', error);
        res.status(500).json({ message: 'Error logging.' });
      }
  }
