import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TLEFController } from '../../TLEF-controller.class';

@Component({
  selector: 'app-tlef-times',
  templateUrl: './tlef-times.component.html',
  styleUrls: ['./tlef-times.component.css']
})
export class TlefTimesComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService) { }


  private _sub: Subscription = new Subscription();
  private _entryStartTime: string;
  private _entryEndTime: string;

  public get controller(): TLEFController { return this.daybookService.tlefController; }

  ngOnInit() {
    // console.log("Opening component")
    this._reload();
    this._sub = this.controller.currentlyOpenTLEFItem$.subscribe(s => this._reload());
  }

  private _reload() {
    
  }


  public get entryStartTime(): string { return this._entryStartTime; }
  public get entryEndTime(): string { return this._entryEndTime; }

}
