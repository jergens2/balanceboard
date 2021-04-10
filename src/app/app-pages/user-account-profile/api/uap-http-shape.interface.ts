export interface UAPHttpShape {
    personalInfo: {
        dateOfBirthYYYYMMDD: string;
        givenName: string;
        familyName: string;
    },
    appPreferences: {
        nightModeIsOn: boolean;
        sidebarIsPinned: boolean;
        daybook: {
            listMode: boolean;
        };
        notebook: {
            searchMode: 'TEXT' | 'TAG' | 'DATE';
        }
    },
    appConfig: {
        defaultWakeupHour: number;
        defaultWakeupMinute: number;
        defaultFallAsleepHour: number;
        defaultFallAsleepMinute: number;
    }
}
