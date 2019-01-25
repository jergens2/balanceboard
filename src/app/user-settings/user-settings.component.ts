import { Component, OnInit } from '@angular/core';
import { UserSetting } from './user-setting.model';
import { UserSettingsService } from './user-settings.service';
import { StylesService } from './styles.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {

  constructor(private settingsService: UserSettingsService, private stylesService: StylesService ) { }

  // allSettings

  userSettings: UserSetting[] = [];

  nightModeSetting: UserSetting;

  ngOnInit() {
    let nightModeSetting: UserSetting = new UserSetting();
    nightModeSetting.name = "night_mode";
    nightModeSetting.id = "night_mode";
    nightModeSetting.isOn = false;
    nightModeSetting.userId = '';  
    this.nightModeSetting = nightModeSetting;
  }


  onClickNightMode(){
    /*
      Todo:  change setting type from string into a Setting class object
    */

    this.nightModeSetting.isOn = !this.nightModeSetting.isOn;
    this.stylesService.nightMode = this.nightModeSetting.isOn;
    // this.settingsService.changeSetting(this.nightModeSetting)


  }

}
