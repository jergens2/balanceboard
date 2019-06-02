import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ITLEFActivityListItem } from '../tlef-activity-list-item.interface';
import { ITLEFActivitySliderBarItem } from './activity-slider-bar-item.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activity-slider-bar',
  templateUrl: './activity-slider-bar.component.html',
  styleUrls: ['./activity-slider-bar.component.css']
})
export class ActivitySliderBarComponent implements OnInit {

  @Input() activityItem: ITLEFActivityListItem;
  @Output() percentChanged: EventEmitter<number> = new EventEmitter();

  constructor() { }

  private percentChangeSubscription: Subscription = new Subscription();

  ngOnInit() {
    this.percentChangeSubscription = this.activityItem.sliderBar.durationPercent$.subscribe((newPercent)=>{
      this.percentChanged.emit(newPercent);
    });
  }
  ngOnDestroy(){  
    this.percentChangeSubscription.unsubscribe();
  }

  onMouseLeaveSliderBar(){
    this.activityItem.sliderBar.deactivate();    
  }

  onMouseDownGrabber(barItem: ITLEFActivitySliderBarItem){
    this.activityItem.sliderBar.activate();
  }

  onMouseEnterItem(barItem: ITLEFActivitySliderBarItem){
    this.activityItem.sliderBar.mouseOverSliderBarItem(barItem);
  }
  
  onMouseUpItem(barItem: ITLEFActivitySliderBarItem){
    this.activityItem.sliderBar.mouseUpSliderBarItem(barItem);
  }

}
