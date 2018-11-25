import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';
import { HomeService } from '../../dashboard/home/home.service';
import { Component, OnInit } from '@angular/core';

import { faHome, faProjectDiagram, faListOl, faSyncAlt, faDollarSign, faChartPie, faChartLine, faBriefcaseMedical, faWeight, faCogs, faSignOutAlt, faSitemap  } from '@fortawesome/free-solid-svg-icons';
import { faChartBar, faCalendarAlt } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private homeService: HomeService, private authService: AuthenticationService, private router: Router) { }


  faHome = faHome;
  faCalendarAlt = faCalendarAlt;
  faSiteMap = faSitemap;
  faProjectDiagram = faProjectDiagram;
  faChartBar = faChartBar;
  faChartPie = faChartPie;
  faListOl = faListOl;
  faSyncAlt = faSyncAlt;
  faDollarSign = faDollarSign;
  faChartLine = faChartLine;
  faBriefcaseMedical = faBriefcaseMedical;
  faWeight = faWeight;
  faCogs = faCogs;
  faSignOutAlt = faSignOutAlt;


  activeLink = { color: 'red' };
  loggedInUser: string = '';
  userId: string = '';

  ngOnInit() {
    this.loggedInUser = this.authService.authenticatedUser.email;
    this.userId = this.authService.authenticatedUser.id;
  }

  onClickTimeFrameButton(selectedView){
    this.homeService.setView(selectedView);
    this.router.navigate(['/']);
  }

  onClick(button: string){
    this.router.navigate(['/' + button]);
  }

  onClickLogout(){
    this.authService.logout();
  }

}
