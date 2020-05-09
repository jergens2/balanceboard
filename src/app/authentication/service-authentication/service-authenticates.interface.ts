import { Subscription, Observable, BehaviorSubject, Subject } from "rxjs";
import { AuthStatus } from "../auth-status.class";
import { ServiceAuthenticationAttempt } from "./service-authentication-attempt.interface";

export interface ServiceAuthenticates{
    synchronousLogin(userId: string): boolean;
    login$(userId: string): Observable<ServiceAuthenticationAttempt>;
    logout(): void;
}