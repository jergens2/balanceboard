import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserAccount } from './user-account.class';
import * as moment from 'moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { serverUrl } from '../../../serverurl';
import { FriendRequest } from './friend-request.interface';
import { map } from 'rxjs/operators';
import { ServiceAuthenticates } from '../../../authentication/service-authentication/service-authenticates.interface';
import { ServiceAuthenticationAttempt } from '../../../authentication/service-authentication/service-authentication-attempt.interface';

@Injectable({
  providedIn: 'root'
})
export class SocialService implements ServiceAuthenticates{

  private _userId: string;
  private _loginComplete$: BehaviorSubject<ServiceAuthenticationAttempt> = new BehaviorSubject({
    authenticated: false, message: '',
  });
  public synchronousLogin(user: string) { return false;}
  public login$(userId: string): Observable<ServiceAuthenticationAttempt> {
    this._userId = userId;
    this.getFriendRequests();
    return this._loginComplete$.asObservable();
  }
  public logout(){
    this._userId = '';
    this._incomingRequests$.next([]);
    this._outgoingRequests$.next([]);
  }


  constructor(private httpClient: HttpClient) { }

  public generateSocialId(): string {
    let socialId: string = "";
    for (let i = 0; i < 16; i++) {
      socialId += (Math.floor(Math.random() * 16).toString(16).toUpperCase());
    }
    return socialId;
  }

  private _incomingRequests$: BehaviorSubject<FriendRequest[]> = new BehaviorSubject([]);
  private _outgoingRequests$: BehaviorSubject<FriendRequest[]> = new BehaviorSubject([]);
  public get incomingRequests(): FriendRequest[]{
    return this._incomingRequests$.getValue();
  }
  public get incomingRequests$(): Observable<FriendRequest[]> {
    return this._incomingRequests$.asObservable();
  }
  public get outgoingRequests(): FriendRequest[]{
    return this._outgoingRequests$.getValue();
  }
  public get outgoingRequests$(): Observable<FriendRequest[]> {
    return this._outgoingRequests$.asObservable();
  }

  private getFriendRequests() {
    // let getUrl = serverUrl + "/api/social/get-requests/" + this._authStatus.user.socialId;
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json'
    //     // 'Authorization': 'my-auth-token'  
    //   })
    // };

    // this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
    //   .pipe<FriendRequest[]>(map((response) => {
    //     return response.data;
    //   }))
    //   .subscribe((friendRequests: FriendRequest[]) => {
        // let incomingRequests: FriendRequest[] = [];
        // let outgoingRequests: FriendRequest[] = [];
        // friendRequests.forEach((friendRequest: FriendRequest)=>{
        //   if(friendRequest.recipientId == this._authStatus.user.socialId){
        //     incomingRequests.push(friendRequest);
        //   }
        //   else if(friendRequest.requesterId == this._authStatus.user.socialId){
        //     outgoingRequests.push(friendRequest);
        //   }
        // });
        // // console.log("Requests, incoming, outgoing:", incomingRequests, outgoingRequests)
        // this._incomingRequests$.next(incomingRequests);
        // this._outgoingRequests$.next(outgoingRequests);

        // this._loginComplete$.next(true);
      // });
      this._loginComplete$.next({
        authenticated: true,
        message: 'Social service logged in, but disabled.'
      });
  }


  public sendFriendRequest(friendId: string) {

    // let postUrl = serverUrl + "/api/social/new-friend-request";
    // let friendRequestBody: FriendRequest = {
    //   requesterId: this._authStatus.user.socialId,
    //   recipientId: friendId,
    //   dateISO: moment().toISOString(),
    // }
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json'
    //     // 'Authorization': 'my-auth-token'  
    //   })
    // };
    // this.httpClient.post

    // this.httpClient.post<{ message: string, data: any }>(postUrl, friendRequestBody, httpOptions)
    //   .pipe<FriendRequest>(map((response) => {
    //     return response.data;
    //   }))
    //   .subscribe((friendRequest: FriendRequest) => {
    //     let outgoingRequests = this._outgoingRequests$.getValue();
    //     outgoingRequests.push(friendRequest);
    //     this._outgoingRequests$.next(outgoingRequests);
    //   });

  }
}
