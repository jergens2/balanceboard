
/*
    2018-08-17
    The reason that there is a BodyWeight class instead of just a bodyWeight:number property on the HealthProfile is because
    maybe the user sets his weight one day, and does not update it for another several or many days later.
    But the rest of the health profile can be updated, and this bodyweight subobject retains the last updated date of this property.


    Perhaps at some point in the future it might make sense to make a generic healthProperty class with a name, value, and dateSet
    in this way, the HealthProfile can be a representation of a collection of all of the different properties even though they were 
    collected or set on any various days, and this would retain all of the times when those properties were updated.

    By doing it this way you can measure the change of a given property over the dimension of time, such as bodyWeight over time, 
    or symptoms over time, and so on

*/


export class BodyWeight{

    public weightInKg: number;
    public dateSetISO: string;

    constructor(weightInKg: number, dateSetISO: string){
        this.weightInKg = weightInKg;
        this.dateSetISO = dateSetISO;
    }
     

}