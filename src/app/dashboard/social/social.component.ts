import { Component, OnInit } from '@angular/core';
import { SocialService } from '../../shared/document-definitions/user-account/social.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FriendRequest } from '../../shared/document-definitions/user-account/friend-request.interface';

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.css']
})
export class SocialComponent implements OnInit {

  constructor(private socialService: SocialService) { }

  addFriendForm: FormGroup;
  loading: boolean = true;
  incomingRequests: FriendRequest[] = [];
  outgoingRequests: FriendRequest[] = [];

  ngOnInit() {
    this.addFriendForm = new FormGroup({
      "socialId":new FormControl("", Validators.required),
    });
    this.incomingRequests = this.socialService.incomingRequests;
    this.outgoingRequests = this.socialService.outgoingRequests;
    this.socialService.incomingRequests$.subscribe((requests)=>{
      this.incomingRequests = requests;
    });
    this.socialService.outgoingRequests$.subscribe((requests)=>{
      this.outgoingRequests = requests;
    })
    this.loading = false;
  }

  public get socialId(): string{
    return "warning no social id";
  }

  onClickSendFriendRequest(){
    let friendId: string = this.addFriendForm.controls['socialId'].value;
    if(friendId){
      this.socialService.sendFriendRequest(friendId);
      this._message = "Nice!  Friend request sent to " + friendId + "";
      this.addFriendForm.reset();
    }
  }

  public get formDisabled(): string{
    if(this.addFriendForm.valid){
      return "";
    }else{
      return "disabled";
    }
  }
  private _message: string = "";
  public get message(): string{
    return this._message;
  }
}
