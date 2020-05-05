import { UserAccount } from "../shared/document-definitions/user-account/user-account.class";
import * as moment from "moment";

export class AuthStatus{
    public token: string;
    public user: UserAccount;
    // public isAuthenticated: boolean;
    public expiresAt: moment.Moment;

    constructor(token: string, user: UserAccount, expiresAt: moment.Moment){
        this.token = token;
        this.user = user;
        this.expiresAt = moment(expiresAt);
    }

    public isValid(): boolean { 
        return !this.isExpired();
    }
    
    public isExpired(): boolean {
        const now: moment.Moment = moment();
        if(now.isAfter(this.expiresAt)){
            return true;
        }else{
            return false;
        }
    }
}