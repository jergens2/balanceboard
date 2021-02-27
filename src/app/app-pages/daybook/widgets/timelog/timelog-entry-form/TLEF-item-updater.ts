import { TLEFControllerItem } from './TLEF-controller-item.class';
import { DaybookUpdateAction } from '../../../display-manager/daybook-update-action.enum';

export class TLEFItemUpdater{

    /**
     * The purpose of this class is to manage the changing (updating) of information for the currently open TLEF item.
     * E.g. now time changed, or a new delineator, or a drawn item. 
     * 
     *  
     * Then in this way we do not open items by index, but we rebuild and then resend the currentlyopen item.
     * 
     */
    constructor(){

    }
    

    public update(tlefItems: TLEFControllerItem[], currentItem: TLEFControllerItem, action: DaybookUpdateAction): TLEFControllerItem{
        return
    }

    





}