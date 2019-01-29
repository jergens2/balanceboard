
export class UserSetting {

    name: string;
    numericValue: number;
    stringValue: string;
    booleanValue: boolean;

    constructor(name: string, booleanVal: boolean, numericValue: number, stringValue: string){
        this.name = name;
        this.booleanValue = booleanVal;
        this.numericValue = numericValue;
        this.stringValue = stringValue;
    }
}