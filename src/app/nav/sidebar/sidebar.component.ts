import { Router } from '@angular/router';
import { HomeService } from './../../services/home.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private homeService: HomeService, private router: Router) { }

  ngOnInit() {
  }

  onClickTimeFrameButton(selectedView){
    this.homeService.setView(selectedView);
    this.router.navigate(['/']);
  }

  onClick(button: string){
    this.router.navigate(['/' + button]);
  }

}
