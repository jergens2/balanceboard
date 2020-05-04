import { UserSetting } from "./user-settings/user-setting.model";

export class UserAccount{

    public get httpBody(): any{
        return {
            id: this.id,
            email: this.email,
            socialId: this.socialId,
            userSettings: this.userSettings,
        }
    }


    public id: string;
    public username: string
    public email: string;
    public socialId: string;

    public userSettings: UserSetting[] = [];

    constructor(id: string, email: string, socialId: string, userSettings: UserSetting[]){
        this.id = id;
        this.email = email;
        this.socialId = socialId;
        this.userSettings = userSettings;
    }
}