
export class CategorizedActivity{
    public id: string;
    public name: string;
    public description: string;

    public userId: string;

    public parentActivityId: string;
    public childActivityIds: string[];

    public color: string;
    public icon: string;

    constructor(id: string, name: string, description: string, parentActivityId: string, childActivityIds: string[], color: string){
        this.id = id;
        this.name = name;
        this.description = description;
        this.parentActivityId = parentActivityId;
        this.childActivityIds = childActivityIds;
        this.color = color;
    }



}