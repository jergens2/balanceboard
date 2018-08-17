import { BodyWeight } from './body-weight.model';

export class HealthProfile{

    public id: string;
    public userId: string;

    public bodyWeight: BodyWeight;
    public heightInMeters: number;
    public dateSetISO: string;

    constructor(weightInKg: BodyWeight, heightInM: number, dateSetISO: string){
        this.bodyWeight = weightInKg;
        this.heightInMeters = heightInM;
        this.dateSetISO = dateSetISO;
    }
     

}