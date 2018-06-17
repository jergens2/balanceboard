import { Subscription } from 'rxjs/Subscription';
import { HomeService } from './../services/home.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  
  selectedView: string;
  private viewSubscription: Subscription;

  constructor(
    private homeService: HomeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.selectedView = this.homeService.getView();
    this.viewSubscription = this.homeService.timeViewSubject
      .subscribe(
        (view) => {
          this.selectedView = view;
        }
      )
  }

  onClickTimeFrameButton(selectedView){
    this.homeService.setView(selectedView);
  }

  onClick(button: string){
    this.router.navigate(['/' + button]);
  }
}
