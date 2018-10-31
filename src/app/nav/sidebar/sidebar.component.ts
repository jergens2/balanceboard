import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';
import { HomeService } from '../../dashboard/home/home.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private homeService: HomeService, private authService: AuthenticationService, private router: Router) { }

  activeLink = { color: 'red' };
  loggedInUser: string = '';

  ngOnInit() {
    this.loggedInUser = this.authService.authenticatedUser.email;
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
