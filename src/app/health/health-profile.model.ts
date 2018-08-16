
export class HealthProfile{

    public id: string;
    public userId: string;

    public bodyWeightInKg: number;
    public heightInMeters: number;
    public dateSetISO: string;

    constructor(weightInKg: number, heightInM: number, dateSetISO: string){
        this.bodyWeightInKg = weightInKg;
        this.heightInMeters = heightInM;
        this.dateSetISO = dateSetISO;
    }
     

}