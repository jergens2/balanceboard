import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from './authentication.service';
import { AuthData } from './auth-data.interface';

import { faKey, faUser, faUnlock, faSpinner, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { UserAccount } from '../shared/document-definitions/user-account/user-account.class';
import { UserSetting } from '../shared/document-definitions/user-account/user-settings/user-setting.model';
import { UserSettingsService } from '../shared/document-definitions/user-account/user-settings/user-settings.service';

import { SocialService } from '../shared/document-definitions/user-account/social.service';


@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit, OnDestroy {

  
  faGithub = faGithub;
  faKey = faKey; 
  faUser = faUser;
  faUnlock = faUnlock;
  faSpinner = faSpinner;
  faSignInAlt = faSignInAlt;
  faUserPlus = faUserPlus;

  constructor(private authService: AuthenticationService, private userSettingsService: UserSettingsService, private socialService: SocialService) { }


  public action: 'INITIAL' | 'LOGIN' | 'REGISTER' = 'INITIAL';
  public get actionIsInitial() { return this.action === 'INITIAL'; }
  public get actionIsLogin() { return this.action === 'LOGIN'; }
  public get actionIsRegister() { return this.action === 'REGISTER'; }

  ngOnInit() {



  }



  ngOnDestroy() {
  }

}
