import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';
import { DaybookSmallWidget } from '../../daybook-small-widget.interface';
import { faExpand } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-daily-task-list-small',
  templateUrl: './daily-task-list-small.component.html',
  styleUrls: ['./daily-task-list-small.component.css']
})
export class DailyTaskListSmallComponent implements OnInit, DaybookSmallWidget {

  constructor() { }

  faExpand = faExpand;

  @Input() activeDay: DaybookDayItem;
  @Output() expand: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
  }

  onClickExpand(){
    console.log("Expanding DTL widget");
    this.expand.emit(true);
  }

}
