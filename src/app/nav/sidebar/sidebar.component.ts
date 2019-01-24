import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { faCogs, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { NavItem } from '../nav-item.model';
import { navigationItems } from '../nav-items';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private authService: AuthenticationService, private router: Router) { }



  faCogs = faCogs;
  faSignOutAlt = faSignOutAlt;


  activeLink = { color: 'red' };
  loggedInUser: string = '';
  userId: string = '';

  navItems: NavItem[];

  ngOnInit() {
    this.navItems = navigationItems;
    this.loggedInUser = this.authService.authenticatedUser.email;
    this.userId = this.authService.authenticatedUser.id;
  }


  onClick(button: string){
    this.router.navigate(['/' + button]);
  }

  onClickLogout(){
    this.authService.logout();
  }

}
