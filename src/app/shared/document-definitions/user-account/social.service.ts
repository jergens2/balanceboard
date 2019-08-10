import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserAccount } from './user-account.class';
import * as moment from 'moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { serverUrl } from '../../../serverurl';
import { FriendRequest } from './friend-request.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocialService {

  private _authStatus: AuthStatus;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    this.getFriendRequests();
    return this._loginComplete$.asObservable();
  }
  public logout(){
    this._authStatus = null;
  }
  public get userAccount(): UserAccount {
    return this._authStatus.user;
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
    let getUrl = serverUrl + "/api/social/get-requests/" + this._authStatus.user.socialId;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };

    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<FriendRequest[]>(map((response) => {
        return response.data;
      }))
      .subscribe((friendRequests: FriendRequest[]) => {
        let incomingRequests: FriendRequest[] = [];
        let outgoingRequests: FriendRequest[] = [];
        friendRequests.forEach((friendRequest: FriendRequest)=>{
          if(friendRequest.recipientId == this._authStatus.user.socialId){
            incomingRequests.push(friendRequest);
          }
          else if(friendRequest.requesterId == this._authStatus.user.socialId){
            outgoingRequests.push(friendRequest);
          }
        });
        console.log("Requests, incoming, outgoing:", incomingRequests, outgoingRequests)
        this._incomingRequests$.next(incomingRequests);
        this._outgoingRequests$.next(outgoingRequests);

        this._loginComplete$.next(true);
      });
  }


  public sendFriendRequest(friendId: string) {

    let postUrl = serverUrl + "/api/social/new-friend-request";
    let friendRequestBody: FriendRequest = {
      requesterId: this._authStatus.user.socialId,
      recipientId: friendId,
      dateISO: moment().toISOString(),
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.post

    this.httpClient.post<{ message: string, data: any }>(postUrl, friendRequestBody, httpOptions)
      .pipe<FriendRequest>(map((response) => {
        return response.data;
      }))
      .subscribe((friendRequest: FriendRequest) => {
        let outgoingRequests = this._outgoingRequests$.getValue();
        outgoingRequests.push(friendRequest);
        this._outgoingRequests$.next(outgoingRequests);
      });

  }
}
