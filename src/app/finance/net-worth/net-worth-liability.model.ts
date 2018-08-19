

export class NetWorthLiability{

    dateUpdatedISO: string;
    name: string;
    description: string;
    dollarValue: number;
    quantity: number;
    
    constructor(dateUpdated: string){
        this.dateUpdatedISO = dateUpdated;
    }

}