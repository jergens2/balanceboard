export interface UAPAppPreferences{
    nightModeIsOn: boolean;
    sidebarIsPinned: boolean;
    
    daybook: {
        listMode: boolean;
    };

    notebook: {
        searchMode: 'TEXT' | 'TAG' | 'DATE';
    }
}