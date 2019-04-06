import { Component, OnInit, Input } from '@angular/core';
import { ScheduleRotation } from '../schedule-rotation.model';

@Component({
  selector: 'app-rotation-display',
  templateUrl: './rotation-display.component.html',
  styleUrls: ['./rotation-display.component.css']
})
export class RotationDisplayComponent implements OnInit {

  constructor() { }

  @Input() rotation: ScheduleRotation

  ngOnInit() {
  }

}
