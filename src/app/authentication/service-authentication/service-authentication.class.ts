import { ServiceAuthenticates } from "./service-authenticates.interface";
import { Observable, Subject, Subscription, forkJoin } from "rxjs";
import { AuthStatus } from "../auth-status.class";

export class ServiceAuthentication{

    service: ServiceAuthenticates;
    name: string;
    
    private childServices: ServiceAuthenticates[] = [];

    constructor(name: string, service: ServiceAuthenticates){
        this.name = name;
        this.service = service;
    }
    public addChild(childService: ServiceAuthenticates){
        this.childServices.push(childService);
    }

    private _loginComplete$: Subject<boolean> = new Subject();
    private _loginSubscription: Subscription = new Subscription();
    public login$(authStatus: AuthStatus): Observable<boolean>{
        console.log("Logging into service: " + this.name);
        if(this.childServices.length > 0){
            console.log("  Logging into child of service: " + this.name)
            if(this.childServices.length == 1){
                this._loginSubscription = this.service.login$(authStatus).subscribe((loginComplete: boolean)=>{
                    if(loginComplete === true){
                        this.childServices[0].login$(authStatus).subscribe((childLoginComplete: boolean)=>{
                            this._loginComplete$.next(childLoginComplete);
                        })
                    }
                })
            }else if(this.childServices.length > 1){
                let join = forkJoin(this.childServices.map((childService)=>{return childService.login$(authStatus) })).subscribe((values)=>{
                    console.log("Fork join emits val: ", values);
                    let allComplete: boolean = true;
                    values.forEach((value)=>{
                        if(value.valueOf() == false){
                            allComplete = false;
                        }
                    })
                    console.log("all complete then? : ", allComplete);
                    this._loginComplete$.next(allComplete);
                });
            }
        }else{
            this._loginSubscription = this.service.login$(authStatus).subscribe((loginComplete: boolean)=>{
                this._loginComplete$.next(loginComplete);
            })
        }
        
        return this._loginComplete$.asObservable();
    }
    public logout(){
        this._loginSubscription.unsubscribe();

    }

    // private _isAuthenticated: boolean = false;
    // public get isAuthenticated(): boolean{
    //     return this._isAuthenticated;
    // }
}