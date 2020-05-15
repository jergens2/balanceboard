import { AuthData } from "./auth-data.interface";

export class RegistrationController {
    constructor(authData: AuthData) {
        if (authData.email) {
            this._email = authData.email;
        } else {
            console.log("Application error: no email value provided");
        }


        if (authData.username) {
            this._username = authData.username;
            this._usernameStylized = authData.usernameStylized;
        } else {
            this._username = "";
            this._usernameStylized = "";
        }
        this._password = authData.password;
        this._pin = authData.pin;
    }

    private _email: string = '';
    private _username: string = '';
    private _usernameStylized: string = '';
    private _password: string = '';
    private _pin: string = '';

    public get email(): string { return this._email; }
    public get username(): string { return this._username; }
    public get usernameStylized(): string { return this._usernameStylized; }
    public get password(): string { return this._password; }
    public get pin(): string { return this._pin; }

    public get usernameIsPresent(): boolean { 
        if(this.username.length >= 6 && this.username.length <= 24){
            return true;
        }else{
            return false;
        }
    }


    public onPinCreated(pin: string) {
        this._pin = pin;
    }
    public getAuthData(): AuthData {
        let usernameStylized: string = "";
        let username: string = "";
        if (!this.usernameStylized) {
            usernameStylized = 'NO_REGISTERED_USERNAME_USE_EMAIL';
            username = usernameStylized;
          } else {
            username = usernameStylized.toLowerCase();
          }
        return {

            email: this.email,
            username: username,
            usernameStylized: usernameStylized,
            password: this.password,
            pin: this.pin,

        }
    }
}