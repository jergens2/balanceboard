
import { UserAccount } from "../shared/document-definitions/user-account/user-account.class";

export interface AuthData { 
    userAccount: UserAccount;
    password: string;
}