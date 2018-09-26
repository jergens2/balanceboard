import { NetWorthItem } from "./net-worth-item.model";


export class NetWorthProfile{

    public dateUpdatedISO: string;
    public assets: NetWorthItem[];
    public liabilities: NetWorthItem[];

    constructor(dateUpdated: string){
        this.dateUpdatedISO = dateUpdated;
    }
}
