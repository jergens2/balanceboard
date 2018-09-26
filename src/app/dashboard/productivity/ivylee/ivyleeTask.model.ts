
export class IvyLeeTask {

    title: string;
    priority: number;
    category: string;
    details: string;
    isComplete: boolean;
    completionTimeISO: string;
    lengthInSeconds: number;

    constructor(priority: number, title: string){
        this.title = title;
        this.priority = priority;
        this.isComplete = false;
    }

}