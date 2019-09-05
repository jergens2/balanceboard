import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryForm } from '../../timelog-entry-form.class';

@Component({
  selector: 'app-routine-section',
  templateUrl: './routine-section.component.html',
  styleUrls: ['./routine-section.component.css']
})
export class RoutineSectionComponent implements OnInit {

  @Input() timelogEntryForm: TimelogEntryForm;
  @Input("routine") routineString: string;

  private routine: any = null;

  constructor() { }

  ngOnInit() {

  }

}
