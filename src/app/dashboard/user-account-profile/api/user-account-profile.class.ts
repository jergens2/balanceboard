import { UAPPersonalInformation } from './uap-personal-information.interface';
import { UAPAppPreferences } from './uap-app-preferences.interface';
import { UAPAppConfiguration } from './uap-app-configuraiton.interface';
import * as moment from 'moment';
import { UAPHttpShape } from './uap-http-shape.interface';

export class UserAccountProfile {

    private _isValid: boolean = true;
    public get isValid(): boolean { return this._isValid; }
    public get hasPrompt(): boolean { return !this._isValid; }

    private _id: string = '';

    private _personalInfo: UAPPersonalInformation;
    private _appPreferences: UAPAppPreferences;
    private _appConfig: UAPAppConfiguration;

    public get id(): string { return this._id; }

    public get uapPersonalInfo(): UAPPersonalInformation { return this._personalInfo; }
    public get uapAppPreferences(): UAPAppPreferences { return this._appPreferences; }
    public get uapAppConfig(): UAPAppConfiguration { return this._appConfig; }

    public get dateOfBirthYYYYMMDD(): string { return this._personalInfo.dateOfBirthYYYYMMDD }
    public get givenName(): string { return this._personalInfo.givenName; }
    public get familyName(): string { return this._personalInfo.familyName; }

    public get nightModeIsOn(): boolean { return this._appPreferences.nightModeIsOn; }
    public get sidebarIsPinned(): boolean { return this._appPreferences.sidebarIsPinned; }

    public get defaultWakeupHour(): number { return this._appConfig.defaultWakeupHour; }
    public get defaultWakeupMinute(): number { return this._appConfig.defaultWakeupMinute; }
    public get defaultFallAsleepHour(): number { return this._appConfig.defaultFallAsleepHour; }
    public get defaultFallAsleepMinute(): number { return this._appConfig.defaultFallAsleepMinute; }

    public defaultWakeupTime(dateYYYYMMDD: string) {
        return moment(dateYYYYMMDD).startOf('day').add(this.defaultWakeupHour, 'hours').minute(this.defaultWakeupMinute);
    }
    public getdefaultFallAsleepTime(dateYYYYMMDD: string) {
        return moment(dateYYYYMMDD).startOf('day').add(this.defaultFallAsleepHour, 'hours').minute(this.defaultFallAsleepMinute);
    }
    constructor(data) {

        let userProfile: any;
        this._isValid = true;
        if (data) {
            if (data.userProfile) {
                userProfile = data.userProfile;
            } else {
                this._isValid = false;
            }
        } else {
            this._isValid = false;
        }
        this._setId(data);
        this._setPersonalInfo(userProfile);
        this._setAppPreferences(userProfile);
        this._setAppConfig(userProfile);
    }

    public setAppConfig(config: UAPAppConfiguration) {
        this._appConfig = config;
    }

    private _setId(data: any) {
        // console.log("Setting id: ", data)
        if (data) {
            if (data._id) {
                this._id = data._id;
            } else {
                this._isValid = false;
            }
        } else {
            this._isValid = false;
        }
        // console.log("Is valid? ", this.isValid)
    }

    private _setAppConfig(data: any) {
        this._appConfig = {
            defaultWakeupHour: 7,
            defaultWakeupMinute: 30,
            defaultFallAsleepHour: 22,
            defaultFallAsleepMinute: 30,
        };
        if (data) {
            if (data.appConfig) {
                const config = data.appConfig;
                const dwh = config.defaultWakeupHour !== null;
                const dwm = config.defaultWakeupMinute !== null;
                const dsh = config.defaultFallAsleepHour !== null;
                const dsm = config.defaultFallAsleepMinute !== null;
                if (dwh && dwm && dsh && dsm) {
                    this._appConfig = config;
                } else {
                    this._isValid = false;
                }
            } else {
                this._isValid = false;
            }
        } else {
            this._isValid = false;
        }

    }

    private _setPersonalInfo(data: any) {
        this._personalInfo = {
            dateOfBirthYYYYMMDD: '',
            givenName: '',
            familyName: '',
        };
        if (data) {
            if (data.personalInfo) {
                const pi = data.personalInfo;
                const dob = pi.dateOfBirthYYYYMMDD;
                const gn = pi.givenName;
                const fn = pi.familyName;
                if (dob && gn && fn) {
                    this._personalInfo = pi;
                } else {
                    if (dob || gn || fn) {
                        this._personalInfo = {
                            dateOfBirthYYYYMMDD: dob ? dob : '',
                            givenName: gn ? gn : '',
                            familyName: fn ? gn : '',
                        };
                    }
                }
            }
        }

    }
    private _setAppPreferences(data: any) {
        this._appPreferences = {
            nightModeIsOn: false,
            sidebarIsPinned: true,
        }
        if (data) {
            if (data.appPreferences) {
                const ap = data.appPreferences;
                const nightModeOn = ap.nightModeIsOn;
                const sidebarPinned = ap.sidebarIsPinned;
                if (nightModeOn !== null && sidebarPinned !== null) {
                    this._appPreferences = data.appPreferences;
                }
            }
        }

    }

    public userProfileHttp(): UAPHttpShape {
        return {
            personalInfo: {
                dateOfBirthYYYYMMDD: this.dateOfBirthYYYYMMDD,
                givenName: this.givenName,
                familyName: this.familyName,
            },
            appPreferences: {
                nightModeIsOn: this.nightModeIsOn,
                sidebarIsPinned: this.sidebarIsPinned,
            },
            appConfig: {
                defaultWakeupHour: this.defaultWakeupHour,
                defaultWakeupMinute: this.defaultWakeupMinute,
                defaultFallAsleepHour: this.defaultFallAsleepHour,
                defaultFallAsleepMinute: this.defaultFallAsleepMinute,
            },
        };
    }
}