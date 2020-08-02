import { Component, OnInit } from '@angular/core';
import { faList, faRedo } from '@fortawesome/free-solid-svg-icons';
import { ActivityComponentService } from '../activity-component.service';

@Component({
  selector: 'app-activities-toolbar',
  templateUrl: './activities-toolbar.component.html',
  styleUrls: ['./activities-toolbar.component.css']
})
export class ActivitiesToolbarComponent implements OnInit {

  public get faList() { return faList; }
  public get faRedo() { return faRedo; }
  public get isNotLarge(): boolean { return this.activityService.componentSize !== 'LARGE'; }

  constructor(private activityService: ActivityComponentService, ) { }

  ngOnInit(): void {
  }

  public onClickList(){
    this.activityService.toggleList();
  }
  public onClickRestart(){
    this.activityService.restart();
  }

}
