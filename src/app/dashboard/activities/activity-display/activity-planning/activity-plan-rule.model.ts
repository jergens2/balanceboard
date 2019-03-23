
export class ActivityPlanRule{

    //in general, a plan will be either to reduce, or to keep down the number of hours (therefore, set a max/ceiling limit)
    //or, to increase, to keep the number of hours up (therefore, set a min/floor limit)
    
    // planType: string;
    //planType can be "VICE" or "VIRTUE"

    timePeriod: {periodType:string, count:number };
    //periodType can be "DAY", "WEEK", "MONTH", "YEAR"
    // e.g. timePeriod can be 4 days, 1 week, 2 months, etc.

    
    //this is the number of HOURS , in the given timePeriod;
    topRuleLimit: number;
    bottomRuleLimit: number;
    

    constructor(timePeriod: {periodType:string, count:number }, topRuleLimit: number, bottomRuleLimit:number){
        // if(planType == "VICE"){
        //     this.planType = planType;
        // }else if(planType == "VIRTUE"){
        //     this.planType = planType;
        // }else{
        //     console.log("Error: bad plan type: ", planType);
        // }
        this.timePeriod = timePeriod;
        this.topRuleLimit = topRuleLimit;
        this.bottomRuleLimit = bottomRuleLimit;
    }

}