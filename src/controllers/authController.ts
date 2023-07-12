import { Request, Response } from 'express';
import { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB } from '../utility/DB';
import { Email } from "../utility/Email";
import { ApiError } from "../utility/Error/ApiError";
import { ErrorCode } from "../utility/Error/ErrorCode";
import { JWT } from "../utility/JWT";
import { IAccessToken } from "../types/auth/IAccessToken";
import { Crud } from "../utility/Crud";
import { IUserRO, IUserCreate } from '../model/User/IUser';
import { ICreateResponse } from '../types/ICreateResponse';
import { IIndexQuery } from '../types/IIndexQuery';

export const ISSUER = "api-auth";
export const MAGIC_AUD = "api-magic";
export const ACCESS_AUD = "api-access";
export const RENEW_AUD = "api-renew";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, lastName } = req.body;
    console.log('Email:', email);
    console.log('First Name:', firstName);
    console.log('Last Name:', lastName);

// Vérifier si l'utilisateur existe déjà
const indexQuery: IIndexQuery = {
  where: { email: email },
  limit: '1'
};

const indexResponse = await Crud.Index<IUserRO>({
  query: indexQuery,
  table: 'users',
  columns: ['id', 'email']
});

console.log(indexResponse);

const userExists = indexResponse.rows.some((user) => user.email === email);
if (userExists) {
  res.status(400).json({
    error: 'auth/user-exists',
    message: 'User already exists'
  });
  return;
}

    // Créer l'utilisateur
    const userCreationResult = await Crud.Create<IUserCreate>({
      table: 'users',
      body: {
        email: email
      }
    }) as ICreateResponse;
    console.log('User creation result:', userCreationResult);

    const userId = userCreationResult.id;

    // Créer l'entrée correspondante dans la table students
    const db = await DB.Connection;
    const studentInsertResult = await db.query<OkPacket>('INSERT INTO students (userId, studentFirstName, studentLastName) VALUES (?, ?, ?)', [userId, firstName, lastName]);

    if (studentInsertResult[0].affectedRows !== 1) {
      throw new Error('Failed to insert student data');
    }

    console.log('Student insert result:', studentInsertResult);

    // Envoyer le lien magique d'authentification à l'utilisateur
    const jwt = new JWT();
    const encoded = await jwt.create(
      {
        id: userId,
      },
      {
        expiresIn: '30 minutes',
        audience: MAGIC_AUD,
        issuer: ISSUER,
      }
    ) as string;

    const emailer = new Email();
    const link = (process.env.FRONT_URL || `http://localhost:${process.env.PORT}`) + '/auth/login?jwt=' + encodeURIComponent(encoded);
    await emailer.sendMagicLink(email, link, 'Mon service');

    res.json({
      message: 'Registration successful. Please check your email for the magic link to login.'
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user.' });
  }
};




export const login = async (req: Request, res: Response): Promise<void> => {
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
      redirectTo: 'http://localhost:8080/',
      message: 'Normalement ce endpoint va demander au navigateur de rediriger vers votre site ou ressource'
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in.' });
  }
};


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
