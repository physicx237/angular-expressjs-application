import { UserModel } from './user.model';

export type UserDataModel = Omit<UserModel, 'password'>;
