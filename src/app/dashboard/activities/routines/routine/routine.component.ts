import { Component, OnInit, Input } from '@angular/core';
import { RoutineDefinition } from '../routine-definition/api/routine-definition.class';

@Component({
  selector: 'app-routine',
  templateUrl: './routine.component.html',
  styleUrls: ['./routine.component.css']
})
export class RoutineComponent implements OnInit {

  @Input() routine: RoutineDefinition;
  constructor() { }

  ngOnInit() {
  }

}
