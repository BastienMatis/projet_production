export interface IUser {
    id: number;
    username?: string;
    email: string;
  }
  
export type IUserRO = Readonly<IUser>;

export type IUserCreate = Omit<IUser, 'id'>;

export type IUserUpdate = Partial<IUserCreate>;