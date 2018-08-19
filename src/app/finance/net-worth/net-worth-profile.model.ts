import { NetWorthAsset } from "./net-worth-asset.model";
import { NetWorthLiability } from "./net-worth-liability.model";


export class NetWorthProfile{

    public dateUpdatedISO: string;
    public assets: NetWorthAsset[];
    public liabilities: NetWorthLiability[];



    constructor(dateUpdated: string){
        this.dateUpdatedISO = dateUpdated;
    }
}
