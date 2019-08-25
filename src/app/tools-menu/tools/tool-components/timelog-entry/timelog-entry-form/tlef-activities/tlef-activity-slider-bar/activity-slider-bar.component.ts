import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TLEFActivityListItem } from './tlef-activity-list-item.class';
import { ITLEFActivitySliderBarItem } from './activity-slider-bar-item.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activity-slider-bar',
  templateUrl: './activity-slider-bar.component.html',
  styleUrls: ['./activity-slider-bar.component.css']
})
export class ActivitySliderBarComponent implements OnInit {

  @Input() activityItem: TLEFActivityListItem;
  @Output() percentChanged: EventEmitter<number> = new EventEmitter();

  constructor() { }



  ngOnInit() {

  }
  ngOnDestroy(){  

  }

  onMouseLeaveSliderBar(){
    this.activityItem.deactivate();    
  }

  onMouseDownGrabber(barItem: ITLEFActivitySliderBarItem){
    this.activityItem.activate();
  }

  onMouseEnterItem(barItem: ITLEFActivitySliderBarItem){
    this.activityItem.mouseOverSliderBarItem(barItem);
  }
  
  onMouseUpItem(barItem: ITLEFActivitySliderBarItem){
    this.activityItem.mouseUpSliderBarItem(barItem);
  }
  onClickBarItem(barItem: ITLEFActivitySliderBarItem){
    this.activityItem.onClickBarItem(barItem);
  }

}