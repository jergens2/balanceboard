import { User } from "./user.model";

export interface AuthData { 
    userAccount: User;
    password: string;
}