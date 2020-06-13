import { RegistrationData } from "./auth-data.interface";

export class RegistrationController {
    constructor(authData: RegistrationData) {
        console.log("Constructing: ", authData)
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
        if (this.username.length >= 6 && this.username.length <= 24) {
            return true;
        } else {
            return false;
        }
    }


    public onPinCreated(pin: string) {
        this._pin = pin;
    }
    public getAuthData(): RegistrationData {
        let usernameStylized: string = this._usernameStylized;
        let username: string = this._username;
        if (this._username === '') {
            username = 'NO_REGISTERED_USERNAME_USE_EMAIL';
            usernameStylized = 'NO_REGISTERED_USERNAME_USE_EMAIL';
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