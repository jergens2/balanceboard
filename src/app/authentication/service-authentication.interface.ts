import { Subscription, Observable, BehaviorSubject } from "rxjs";
import { AuthStatus } from "./auth-status.class";

export interface ServiceAuthenticates{
    login$(authStatus: AuthStatus): Observable<boolean>;
    logout(): void;
}

export interface ServiceAuthentication{
    name: string,
    // service: any,
    subscription: Subscription,
    isAuthenticated: boolean,
}