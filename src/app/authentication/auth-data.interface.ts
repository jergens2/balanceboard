import { UserAccount } from "../shared/document-definitions/user-account/user-account.class";

export interface AuthData { 
    email: string;
    username: string;
    usernameStylized: string,

    password: string;
    pin: string;
}