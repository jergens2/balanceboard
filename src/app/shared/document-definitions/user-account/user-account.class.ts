import { UserSetting } from "./user-settings/user-setting.model";

export class UserAccountDestroy{

    public get httpBody(): any{
        return {
            id: this.id,
            username: this.username,
            email: this.email,
        }
    }


    public id: string;
    public username: string
    public email: string;


    constructor(id: string, username: string, email: string, ){
        this.id = id;
        this.email = email;
        this.username = username;
    }
}