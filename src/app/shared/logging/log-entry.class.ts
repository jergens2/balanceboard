export class LogEntry {
    constructor(message: string, isError?: boolean) {
        this.logMessage = message;
        if (isError !== null) {
            this.isError = isError;
        }
    }

    public isError: boolean = false;
    public logMessage: string = "";

}