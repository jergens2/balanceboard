import { Component, OnInit } from '@angular/core';
import { UserSetting } from './user-setting.model';
import { UserSettingsService } from './user-settings.service';
import { StylesService } from './styles.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { User } from '../authentication/user.model';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {

  constructor(private authService: AuthenticationService,  private settingsService: UserSettingsService, private stylesService: StylesService ) { }

  ifLoading: boolean = true;

  userSettings: UserSetting[] = [];

  nightModeSetting: UserSetting = new UserSetting("night_mode", false, null, null);

  authenticatedUser: User;

  ngOnInit() {
    // this.authenticatedUser = this.authService.authenticatedUser;

    for(let userSetting of this.authenticatedUser.userSettings){
      this.userSettings.push(userSetting);
    }
    
    for(let setting of this.userSettings){
      if(setting.name == "night_mode"){
        this.nightModeSetting = setting;
      }
    }
    this.ifLoading = false;
    }


  onClickNightMode(){
    /*
      Todo:  change setting type from string into a Setting class object
    */

    this.nightModeSetting.booleanValue = !this.nightModeSetting.booleanValue;
    this.stylesService.nightMode = this.nightModeSetting.booleanValue;
    // this.settingsService.changeSetting(this.nightModeSetting)

    console.log("saving to settingsService")
    this.settingsService.saveNightMode(this.nightModeSetting.booleanValue);
  }

}
