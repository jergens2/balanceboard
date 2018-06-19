
export class IvyLeeTask {

    title: string;
    priority: number;
    category: string;
    details: string;

    constructor(priority: number, title: string){
        this.title = title;
        this.priority = priority;
    }

}