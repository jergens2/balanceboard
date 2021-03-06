import { ActivityCategoryDefinition } from "../../app-pages/activities/api/activity-category-definition.class";
import { Subject, Observable } from "rxjs";
import { ActivityHttpService } from "../../app-pages/activities/api/activity-http.service";

export class SaveActivityChain{

    private activitiesToSave: ActivityCategoryDefinition[] = [];
    private activitiesService: ActivityHttpService;
    constructor(activitiesToSave: ActivityCategoryDefinition[], activitiesService: ActivityHttpService){
        this.activitiesToSave = activitiesToSave;
        this.activitiesService = activitiesService;
        this.startLink = this.buildChain();
    }

    private startLink: ActivityChainLink;
    public saveActivities$(): Observable<ActivityCategoryDefinition> {
        let isSaved$: Subject<ActivityCategoryDefinition> = new Subject();
        if(this.startLink){
            // console.log("link: ", this.startLink)
            this.startLink.linkSaved$.subscribe((bottomActivity: ActivityCategoryDefinition)=>{
                if(bottomActivity != null){
                    isSaved$.next(bottomActivity);
                }
            });
            this.startLink.saveChainLink();
        }else{
            console.log("There is no startlink.  ")
        }
        return isSaved$.asObservable();
    }
    private buildChain(): ActivityChainLink{
        if(this.activitiesToSave.length > 0){
            let startLink: ActivityChainLink;
            let chainLinks: ActivityChainLink[] = [];
            for(let i=this.activitiesToSave.length-1; i>=0; i--){
                if(i == this.activitiesToSave.length-1){
                    chainLinks.push(new ActivityChainLink(this.activitiesToSave[i], null, this.activitiesService));
                }else{
                    let lastLink: ActivityChainLink = chainLinks[chainLinks.length-1];
                    chainLinks.push(new ActivityChainLink(this.activitiesToSave[i], lastLink, this.activitiesService));
                }
            }
            startLink = chainLinks[chainLinks.length-1];
            return startLink;
        }else{
            console.log("Error, no activities to save.");
        } 
    }


}
export class ActivityChainLink{

    private activitiesService: ActivityHttpService;
    constructor(thisActivity:ActivityCategoryDefinition, nextChainLink: ActivityChainLink, activitiesService: ActivityHttpService){
        
        this.activity = thisActivity;
        this.activitiesService = activitiesService;
        if(nextChainLink){
            this.nextChainLink = nextChainLink;
        }else{

        }
        
    }

    public updateParentTreeId(parentTreeId: string){
        this.activity.parentTreeId = parentTreeId;
    }

    private _linkSaved$: Subject<ActivityCategoryDefinition> = new Subject();
    public get linkSaved$():Observable<ActivityCategoryDefinition>{
        return this._linkSaved$.asObservable();
    }
    public saveChainLink(){ 
        if(!this.nextChainLink){
            
        }
        this.activitiesService.saveActivity$(this.activity).subscribe((savedActivity: ActivityCategoryDefinition)=>{
            // console.log("Activity saved : " + savedActivity);
            let treeId: string = savedActivity.treeId;
            if(this.nextChainLink != null){
                this.nextChainLink.updateParentTreeId(treeId);
                this.nextChainLink.linkSaved$.subscribe((bottomActivity: ActivityCategoryDefinition)=>{
                    this._linkSaved$.next(bottomActivity);
                });
                this.nextChainLink.saveChainLink();
            }else{ 
                // console.log("finished at the bottom.  NEXT");
                this._linkSaved$.next(this.activity);
            }
        });
    }

    private nextChainLink: ActivityChainLink;

    activity: ActivityCategoryDefinition;

    followingChainLink: ActivityChainLink;
    nameError: boolean = false;
    isSaved: boolean = false;
    
}