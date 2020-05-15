import { Component, OnInit } from '@angular/core';
import { UserSetting } from './user-setting.model';
import { UserSettingsService } from './user-settings.service';
import { AuthenticationService } from '../../../../authentication/authentication.service';
import { AuthStatus } from '../../../../authentication/auth-status.class';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {

  constructor(private settingsService: UserSettingsService) { }

  ifLoading: boolean = true;

  userSettings: UserSetting[] = [];

  nightModeSetting: UserSetting = new UserSetting("night_mode", false, null, null);



  ngOnInit() {

    this.settingsService.userSettings$.subscribe((userSettings: UserSetting[]) => {
      this.userSettings = Object.assign([], userSettings);
      for (let setting of this.userSettings) {
        if (setting.name == "night_mode") {
          // console.log("onInit: setting nightmode setting to ", setting);
          this.nightModeSetting.booleanValue = setting.booleanValue;
        }
      }
      this.ifLoading = false;

    })
  }



  onClickNightMode() {

    this.nightModeSetting.booleanValue = !this.nightModeSetting.booleanValue;

    // console.log("saving to settingsService", this.nightModeSetting);
    this.settingsService.saveSetting(this.nightModeSetting);
  }

}
