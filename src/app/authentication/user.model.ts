import { UserSetting } from "../user-settings/user-setting.model";

export class User{
    public id: string;
    public name: string
    public email: string;

    public userSettings: UserSetting[] = [];

    constructor(id: string, email: string, userSettings: UserSetting[]){
        this.id = id;
        this.email = email;
        this.userSettings = userSettings;
    }
}