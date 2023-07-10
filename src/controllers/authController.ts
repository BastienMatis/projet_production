import { Request, Response, NextFunction } from 'express';
import { IUserRO } from "../model/User/IUser";
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';
import { IRequestMagicLink, IRequestMagicLinkResponse } from "../types/auth/IRequestMagicLink";
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
      const connection = await DB.Connection; // Assuming DB.Connection returns a valid connection object
  
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


// export const magic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const connection = await DB.Connection;
//     const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM users WHERE users.email = ?');
    // const email = req.body; // Récupérer les valeurs d'email à partir de la requête
    // if (!email) {
    //   throw new ApiError(ErrorCode.BadRequest, 'auth/missing-email', "Email is missing in magic link request.");
    // }  

//     // Utilisation d'une requête préparée pour éviter les injections SQL
    
//     // const query = 'SELECT * FROM users WHERE users.email = ?';
//     // const rows = await connection.query<RowDataPacket[]>(query, [email]);
//     // console.log(rows)

//     if (rows[0].length > 0) {
//       // Handle the case where no user with the specified email was found
//       const user = rows[0][0];
//       console.log(user);

//     // Create the new JWT
//     const jwt = new JWT();
//     const encoded = await jwt.create(
//       {
//         id: user.id,
//       },
//       {
//         expiresIn: '30 minutes',
//         audience: MAGIC_AUD,
//         issuer: ISSUER,
//       }
//     ) as string;

//     const emailer = new Email();
  
//       const link = (process.env.FRONT_URL || 'http://localhost:' + (process.env.PORT)) + '/auth/login?jwt=' + encodeURIComponent(encoded);
//       await emailer.sendMagicLink(email, link, 'Mon service');
  
//       res.json({
//         ok: true
//       });
//     } catch (err) {
//         next(err)
//   }; 
// }

// export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const connection = await DB.Connection;
//     if (!req.query.jwt) {
//       throw new ApiError(ErrorCode.BadRequest, 'auth/missing-magic-link-token', "Token is missing in login request.");
//     }

//     const jwt = new JWT();
//     const decoded = await jwt.decode(req.query.jwt.toString(), {
//       issuer: ISSUER,
//       audience: MAGIC_AUD,
//     });

//     if (!decoded.userId) {
//       throw new ApiError(ErrorCode.Unauthorized, 'auth/invalid-magic-link-token', "userId was not found in the payload for token");
//     }

//     // Vérifier que l'utilisateur existe toujours
//     const query = 'SELECT * FROM users WHERE users.id = ?';
//     const [rows] = await connection.query<RowDataPacket[]>(query, [decoded.id]);

//     if (rows.length === 0) {
//       // Handle the case where no user with the specified email was found
//     }
//     const user = rows[0];

//     let payload: IAccessToken = {
//       id: user.id
//     };

//     const access = await jwt.create(payload, {
//       expiresIn: '12 hours',
//       issuer: ISSUER,
//       audience: ACCESS_AUD,
//     });

//     const renew = await jwt.create(payload, {
//       expiresIn: '1 week',
//       issuer: ISSUER,
//       audience: RENEW_AUD,
//     });

//     res.json({
//       access: access,
//       renew: renew,
//       redirectTo: 'https://lien.vers.mon.front',
//       message: 'Normalement ce endpoint va demander au navigateur de rediriger vers votre site ou ressource'
//     });
//   } catch (err) {
//     next(err)
//   }
// }