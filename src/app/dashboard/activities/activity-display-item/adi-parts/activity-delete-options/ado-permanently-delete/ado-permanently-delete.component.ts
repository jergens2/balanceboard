import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../../../daybook/api/daybook-day-item.class';
import { ActivityComponentService } from '../../../../activity-component.service';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-ado-permanently-delete',
  templateUrl: './ado-permanently-delete.component.html',
  styleUrls: ['./ado-permanently-delete.component.css']
})
export class AdoPermanentlyDeleteComponent implements OnInit {

  public get faExclamationTriangle() { return faExclamationTriangle; }
  constructor(private activitiesService: ActivityComponentService) { }

  @Input() public daybookItems: DaybookDayItem[] = [];

  ngOnInit(): void {
  }
  public onDeleteActivity() { this.activitiesService.executePermanentlyDeleteActivity(); }

}
