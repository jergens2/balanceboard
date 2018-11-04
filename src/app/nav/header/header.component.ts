import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { faCalendarAlt, faCaretSquareDown } from '@fortawesome/free-regular-svg-icons';
import { faHome, faProjectDiagram, faChartBar, faChartPie, faListOl, faSyncAlt, faDollarSign, faChartLine, faBriefcaseMedical, faWeight, faCogs, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  constructor(private router: Router) { }
  faCaretSquareDown = faCaretSquareDown;
  faHome = faHome;
  faCalendarAlt = faCalendarAlt;
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

  menuIsExpanded: boolean;
  menuSubscription: Subscription;

  // documentClickListener: Observable<Event> = fromEvent(document, 'click');

  ngOnInit() {
    this.menuIsExpanded = false;
    this.menuSubscription = new Subscription();
  }

  onClickMenuButton(){
    this.menuIsExpanded = !this.menuIsExpanded;
    this.menuSubscription.unsubscribe();
  }

  onMouseEnterMenu(){
    this.menuSubscription.unsubscribe();
  }
  
  onMouseLeaveMenu(){
    this.menuSubscription.unsubscribe();
    let documentClickListener: Observable<Event> = fromEvent(document, 'click');
    this.menuSubscription = documentClickListener.subscribe((click)=>{  
      this.menuIsExpanded = false;
    })

  }

  onClickMenuItem(){
    this.menuSubscription.unsubscribe();
    this.menuIsExpanded = false;
  }



  ngOnDestroy(){
    this.menuSubscription.unsubscribe();
  }

}
