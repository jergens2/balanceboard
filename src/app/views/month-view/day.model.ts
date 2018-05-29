
export class Day {

    public date: Date;
    public dateYYYYMMDD: string;
    public svgPath: string;
    public style: {};

    constructor(
        date: Date,
        dateYYYYMMDD: string,
        svgPath: string,
        style: {}
    ){
        this.date = date;
        this.dateYYYYMMDD = dateYYYYMMDD;
        this.svgPath = svgPath;
        this.style = style;
    }

}