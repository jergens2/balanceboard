import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import { ISchedulingComponent } from './scheduling-component.interface';

@Component({
  selector: 'app-scheduling',
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.css']
})
export class SchedulingComponent implements OnInit {

  constructor(private router: Router) { }

  faExternalLinkAlt = faExternalLinkSquareAlt;


  schedulingComponents: ISchedulingComponent[] = [];

  ngOnInit() {
    this.schedulingComponents = [
      {
        title: 'Schedule Rotations',
        mouseOver: false,
        routerLink: '/schedule-rotations',
        description: '',
        icon: null,
      },
      {
        title: 'Day Templates',
        mouseOver: false,
        routerLink: '/day-templates',
        description: '',
        icon: null,
      },
      {
        title: 'Recurring Tasks',
        mouseOver: false,
        routerLink: '/recurring-tasks',
        description: '',
        icon: null,
      },
    ]
  }

  onClickOpenComponent(component: ISchedulingComponent) {
    try {
      this.router.navigate([component.routerLink]);
    } catch (error) {
      console.log("Error navigating", error);
    }

  }
  
  onMouseEnterComponent(component: ISchedulingComponent){
    component.mouseOver = true;
  }
  onMouseLeaveComponent(component: ISchedulingComponent){
    component.mouseOver = false;
  }



}
