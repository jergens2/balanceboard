import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-activities-default-view',
  templateUrl: './default-view.component.html',
  styleUrls: ['./default-view.component.css']
})
export class ActivitiesDefaultViewComponent implements OnInit {

  constructor() { }

  @Output() newActivity: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
  }

  onClickCreateNewActivity(){
    this.newActivity.emit();
  }

}
