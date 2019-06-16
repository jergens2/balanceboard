import { Component, OnInit } from '@angular/core';
import { SocialService } from '../../shared/document-definitions/user-account/social.service';

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.css']
})
export class SocialComponent implements OnInit {

  constructor(private socialService: SocialService) { }

  ngOnInit() {
    
  }

  public get socialId(): string{
    return this.socialService.userAccount.socialId;
  }

}
