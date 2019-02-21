import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { faCogs, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { NavItem } from '../nav-item.model';
import { appMenuItems } from '../app-menu-items';
import { AuthStatus } from '../../authentication/auth-status.model';
import { Subscription } from 'rxjs';
import { UserSettingsService } from '../../user-settings/user-settings.service';
import { UserSetting } from '../../user-settings/user-setting.model';
import { User } from '../../authentication/user.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private authService: AuthenticationService, private userSettingsService: UserSettingsService, private router: Router) { }



  faCogs = faCogs;
  faSignOutAlt = faSignOutAlt;


  activeLink = { color: 'red' };
  private authStatus: AuthStatus = null;
  private authSubscription: Subscription = new Subscription();
  user: User = null;

  navItems: NavItem[];


  nightMode: UserSetting = null;

  ngOnInit() {
    this.navItems = appMenuItems;

    this.userSettingsService.userSettings$.subscribe((userSettings: UserSetting[])=>{
      // console.log("usersettings", userSettings);

      for(let setting of userSettings){
        if(setting.name == "night_mode"){
          // console.log("sidebar:  setting nightmode to ", setting);
          this.nightMode = setting;
        }
      }
    })
    // console.log("sidebar: this.nightMode = " , this.nightMode)

    this.authSubscription = this.authService.authStatus$.subscribe((authStatus: AuthStatus)=>{
      if(authStatus != null){
        if(authStatus.user != null){
          // console.log("receiving authstatus from authService", authStatus.user.email);
          this.authStatus = authStatus;
          this.user = this.authStatus.user;
        }
      }
    })

    // this.stylesService.nightMode$.subscribe((nightModeValue)=>{
    //   this.nightMode = nightModeValue;
    // })
  }

  get routerLinkActiveClass(): string {
    if(this.nightMode.booleanValue){
      return "active-link-night-mode";
    }else{
      return "active-link";
    }
  }


  onClick(button: string){
    this.router.navigate(['/' + button]);
  }

  onClickLogout(){
    
    this.user = null;
    this.authStatus = null;
    this.authSubscription.unsubscribe();
    this.authService.logout();

    // console.clear();
  }

}
