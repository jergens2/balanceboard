import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { HomeService } from '../../services/home.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private homeService: HomeService, private authService: AuthenticationService, private router: Router) { }

  activeLink = { color: 'red' };

  ngOnInit() {
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
