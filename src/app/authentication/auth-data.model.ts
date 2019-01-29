import { User } from "./user.model";

export interface AuthData { 
    user: User;
    password: string;
}