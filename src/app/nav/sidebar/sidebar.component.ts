import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { faCogs, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { NavItem } from '../nav-item.model';
import { navigationItems } from '../nav-items';
import { StylesService } from '../../user-settings/styles.service';
import { AuthStatus } from '../../authentication/auth-status.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private authService: AuthenticationService, private stylesService: StylesService, private router: Router) { }



  faCogs = faCogs;
  faSignOutAlt = faSignOutAlt;


  activeLink = { color: 'red' };
  private authStatus: AuthStatus = null;
  private authSubscription: Subscription = new Subscription();
  loggedInUser: string = '';
  userId: string = '';

  navItems: NavItem[];


  nightMode: boolean = false;

  ngOnInit() {
    this.navItems = navigationItems;

    let authSubscription = this.authService.authStatus$.subscribe((authStatus: AuthStatus)=>{
      if(authStatus != null){
        if(authStatus.user != null){
          this.authStatus = authStatus;
          this.loggedInUser = this.authStatus.user.email;
          this.userId = this.authStatus.user.id;
        }
      }
    })

    this.stylesService.nightMode$.subscribe((nightModeValue)=>{
      this.nightMode = nightModeValue;
    })
  }


  onClick(button: string){
    this.router.navigate(['/' + button]);
  }

  onClickLogout(){
    this.userId = "";
    this.loggedInUser = "";
    this.authStatus = null;
    this.authSubscription.unsubscribe();
    this.authService.logout();
  }

}
