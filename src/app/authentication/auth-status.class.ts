import { UserAccount } from "../shared/document-definitions/user-account/user-account.class";

export class AuthStatus{
    public token: string;
    public user: UserAccount;
    public isAuthenticated: boolean;

    constructor(token: string, user: UserAccount, isAuthenticated: boolean){
        this.token = token;
        this.user = user;
        this.isAuthenticated = isAuthenticated;
    }
}