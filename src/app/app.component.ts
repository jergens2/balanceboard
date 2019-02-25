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

  faSpinner = faSpinner;

  authenticated: boolean = false;
  loading: boolean = true;
  nightMode: UserSetting = null;
  sideBarOpen: boolean = false;

  constructor(private authService: AuthenticationService, private userSettingsService: UserSettingsService) { }

  ngOnInit() {

    this.userSettingsService.userSettings$.subscribe((userSettings: UserSetting[])=>{
      for(let setting of userSettings){
        if(setting.name == "night_mode"){
          this.nightMode = setting;
        }
      }
    });

    this.authService.authStatus$.subscribe(
      (authStatus: AuthStatus) => {
        if (authStatus.isAuthenticated) {
          this.loading = false;
          this.authenticated = true;
        } else {
          this.authenticated = false;
        }
      }
    )
    this.authService.checkLocalStorage$.subscribe((isPresent: boolean) => {
      if (isPresent) {

      } else {
        this.loading = false;
      }
    })
    this.authService.checkLocalStorage();

    if(localStorage.getItem("sidebar_is_open") == "true"){
      this.sideBarOpen = true;
    }
  }


  onHeaderSidebarButtonClicked(){
    this.sideBarOpen = !this.sideBarOpen;
    localStorage.setItem("sidebar_is_open", this.sideBarOpen.toString());
  }


}
