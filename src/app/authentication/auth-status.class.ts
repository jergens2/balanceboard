import * as moment from "moment";

export class AuthStatus {


    private _expiresAt: moment.Moment;
    private _token: string = "";
    private _username: string = "";
    private _email: string = "";
    private _userId: string = "";
    private _isLocked: boolean = false;

    constructor(token: string, userId: string, username: string, email: string, expiresAt: moment.Moment) {
        this._token = token;
        this._userId = userId;
        this._username = username;
        this._email = email;
        this._expiresAt = moment(expiresAt);
    }

    public get token(): string { return this._token; }
    public get username(): string { return this._username; }
    public get email(): string { return this._email; }
    public get userId(): string { return this._userId; }
    public get expiresAt(): moment.Moment { return this._expiresAt; }
    
    public get isLocked(): boolean { return this._isLocked; }

    public lock(){

        this._isLocked = true;
        
    }

    public isAuthenticated(): boolean {
        return !this.isExpired();
    }

    public isExpired(): boolean {
        const now: moment.Moment = moment();
        if (now.isAfter(this._expiresAt)) {
            return true;
        } else {
            return false;
        }
    }
}