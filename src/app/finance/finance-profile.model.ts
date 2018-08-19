import { NetWorthProfile } from "./net-worth/net-worth-profile.model";

export class FinanceProfile{

    public netWorthProfile: NetWorthProfile;
    public budget: boolean;
    public dateUpdatedISO: string;

    constructor(dateUpdated: string, netWorthProfile: NetWorthProfile){
        this.netWorthProfile = netWorthProfile;
        this.dateUpdatedISO = dateUpdated;
    }
}