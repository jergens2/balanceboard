import { ServiceAuthenticates } from "./service-authenticates.interface";
import { Observable, Subject, Subscription, forkJoin, BehaviorSubject } from "rxjs";
import { AuthStatus } from "../auth-status.class";

export class ServiceAuthentication {

    service: ServiceAuthenticates;
    name: string;

    constructor(name: string, service: ServiceAuthenticates) {
        this.name = name;
        this.service = service;
    }

    private _loginSubscription: Subscription = new Subscription();
    public get loginComplete(): boolean {
        return this._loginComplete$.getValue();
    }
    private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public get loginComplete$(): Observable<boolean> {
        return this._loginComplete$.asObservable();
    }
    public login$(authStatus: AuthStatus): Observable<boolean> {

        this.service.login$(authStatus).subscribe((val) => {
            if (val === true){
                this._loginComplete$.next(val);
            }
        });

        return this.loginComplete$;
    }
    public logout() {
        console.log("Logging out of service: " + this.name)
        this._loginComplete$.next(false);
        this.service.logout();
        this._loginSubscription.unsubscribe();
    }
}