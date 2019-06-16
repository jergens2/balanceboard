import { UserSetting } from "./user-setting.model";

let defaultSettings: UserSetting[] = [];

defaultSettings.push(new UserSetting("night_mode", false, null, null));




export const defaultUserSettings: UserSetting[] = defaultSettings;