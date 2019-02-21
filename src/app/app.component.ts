import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthStatus } from './authentication/auth-status.model';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { UserSettingsService } from './user-settings/user-settings.service';
import { UserSetting } from './user-settings/user-setting.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  faSpinner = faSpinner;

  authenticated: boolean = false;
  loading: boolean = true;

  nightMode: UserSetting = null;

  sideBarOpen: boolean = false;

  constructor(private authService: AuthenticationService, private userSettingsService: UserSettingsService) { }

  ngOnInit() {

    this.userSettingsService.userSettings$.subscribe((userSettings: UserSetting[])=>{
      // console.log("usersettings", userSettings);

      for(let setting of userSettings){
        if(setting.name == "night_mode"){
          // console.log("sidebar:  setting nightmode to ", setting);
          this.nightMode = setting;
        }
      }
    })

    this.authService.authStatus$.subscribe(
      (authStatus: AuthStatus) => {
        // console.log("authstatus", authStatus);
        if (authStatus.isAuthenticated) {
          this.loading = false;
          this.authenticated = true;
        } else {
          this.authenticated = false;
        }
      }
    )
    this.authService.checkLocalStorage$.subscribe((isPresent: boolean) => {
      // console.log("is local storage presnet? ", isPresent);
      if (isPresent) {

      } else {
        this.loading = false;
      }
    })
    this.authService.checkLocalStorage();

  }


  onHeaderSidebarButtonClicked(){
    this.sideBarOpen = !this.sideBarOpen;
  }
}
