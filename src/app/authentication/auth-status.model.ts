import { User } from "./user.model";

export class AuthStatus{
    public token: string;
    public user: User;
    public isAuthenticated: boolean;

    constructor(token: string, user: User, isAuthenticated: boolean){
        this.token = token;
        this.user = user;
        this.isAuthenticated = isAuthenticated;
    }
}