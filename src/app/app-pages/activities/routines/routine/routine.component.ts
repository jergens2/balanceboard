import { Component, OnInit, Input } from '@angular/core';
import { RoutineDefinition } from '../api/routine-definition.class';
import { ActivityHttpService } from '../../api/activity-http.service';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-routine',
  templateUrl: './routine.component.html',
  styleUrls: ['./routine.component.css']
})
export class RoutineComponent implements OnInit {

  @Input() routine: ActivityCategoryDefinition;
  constructor(private activitiesService: ActivityHttpService) { }


  private _activities: ActivityCategoryDefinition[] = [];
  public get activities(): ActivityCategoryDefinition[] {
    return this._activities;
  }

  ngOnInit() {
    let activities: ActivityCategoryDefinition[] = [];
    this.routine.routineMembersActivityIds.forEach((id)=>{
      activities.push(this.activitiesService.findActivityByTreeId(id));
    });
    this._activities = activities;

  }


  faSyncAlt = faSyncAlt;

}
