export class User{
    public id: string;
    public name: string
    public email: string;

    constructor(id: string, email: string){
        this.id = id;
        this.email = email;
    }
}