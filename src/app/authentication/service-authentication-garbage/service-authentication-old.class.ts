import { ServiceAuthenticates } from "./service-authenticates.interface";
import { Observable, Subject, Subscription, forkJoin, BehaviorSubject } from "rxjs";
import { AuthStatus } from "../auth-status.class";
import { ServiceAuthenticationAttempt } from "./service-authentication-attempt.interface";

export class ServiceAuthenticationOld implements ServiceAuthenticates {

    service: ServiceAuthenticates;
    name: string;

    constructor(name: string, service: ServiceAuthenticates) {
        this.name = name;
        this.service = service;
    }

    private _loginSubscription: Subscription = new Subscription();
    public get loginComplete(): boolean {
        return this._loginComplete$.getValue().authenticated;
    }
    private _loginComplete$: BehaviorSubject<ServiceAuthenticationAttempt> = new BehaviorSubject({
        authenticated: false,
        message: '',
    });
    public get loginComplete$(): Observable<ServiceAuthenticationAttempt> {
        return this._loginComplete$.asObservable();
    }

    public synchronousLogin(userId: string) { 
        return this.service.synchronousLogin(userId); 
    }
    public login$(userId: string): Observable<ServiceAuthenticationAttempt> {
        return this.service.login$(userId);
    }
    public logout() {
        console.log("Logging out of service: " + this.name)
        this._loginComplete$.next({
            authenticated: false,
            message: '',
        });
        this.service.logout();
        this._loginSubscription.unsubscribe();
    }
}