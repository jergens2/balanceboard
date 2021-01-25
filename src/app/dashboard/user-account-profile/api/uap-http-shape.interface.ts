export interface UAPHttpShape{
    personalInfo: { 
        dateOfBirthYYYYMMDD: string;
        givenName: string;
        familyName: string;
    },
    appPreferences: { 
        nightModeIsOn: boolean;
        sidebarIsPinned: boolean;
    },
    appConfig: { 
        defaultWakeupHour: number;
        defaultWakeupMinute: number;
        defaultFallAsleepHour: number;
        defaultFallAsleepMinute: number;
    }
}
