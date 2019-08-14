import { ServiceAuthenticates } from "./service-authenticates.interface";
import { Observable, Subject, Subscription, forkJoin, BehaviorSubject } from "rxjs";
import { AuthStatus } from "../auth-status.class";

export class ServiceAuthentication {

    service: ServiceAuthenticates;
    name: string;

    private childService: ServiceAuthenticates = null;

    constructor(name: string, service: ServiceAuthenticates) {
        this.name = name;
        this.service = service;
    }
    public setChild(childService: ServiceAuthenticates) {
        this.childService = childService;
    }

    private _loginSubscription: Subscription = new Subscription();
    public get loginComplete(): boolean{
        return this._loginComplete$.getValue();
    }
    private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false); 
    public get loginComplete$(): Observable<boolean> {
        return this._loginComplete$.asObservable();
    }
    public login$(authStatus: AuthStatus) : Observable<boolean>{
        if (this.childService) {
            // console.log(" ** Logging in to child of this service: " + this.name)
            this._loginSubscription = this.service.login$(authStatus).subscribe((loginComplete: boolean) => {
                if (loginComplete === true) {
                    this.childService.login$(authStatus).subscribe((val) => {
                        if (val === true)
                            this._loginComplete$.next(val);
                    });
                }
            });
        } else {
            this.service.login$(authStatus).subscribe((val) => {
                if (val === true)
                this._loginComplete$.next(val);
            });
        }
        return this.loginComplete$;
    }
    public logout() {
        this._loginSubscription.unsubscribe();

    }
}