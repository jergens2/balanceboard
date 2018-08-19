
export class NetWorthAsset{

    dateUpdatedISO: string;
    title: string;
    description: string;
    value: number;
    quantity: number;
    type: string;
    
    constructor(dateUpdated: string){
        this.dateUpdatedISO = dateUpdated;
    }

}