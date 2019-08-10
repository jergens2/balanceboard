import { Subscription, Observable, BehaviorSubject } from "rxjs";
import { AuthStatus } from "../auth-status.class";

export interface ServiceAuthenticates{
    login$(authStatus: AuthStatus): Observable<boolean>;
    logout(): void;
}