import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-fall-asleep-time',
  templateUrl: './fall-asleep-time.component.html',
  styleUrls: ['./fall-asleep-time.component.css']
})
export class FallAsleepTimeComponent implements OnInit {

  constructor() { }

  @Output() close: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
  }

}
