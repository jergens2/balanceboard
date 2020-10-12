import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFController } from '../../TLEF-controller.class';


@Component({
  selector: 'app-tlef-new-previous',
  templateUrl: './tlef-new-previous.component.html',
  styleUrls: ['./tlef-new-previous.component.css']
})
export class TlefNewPreviousComponent implements OnInit {

  private _controller: TLEFController;
  @Input() public set controller(controller: TLEFController) { this._controller = controller; }
  public get controller(): TLEFController { return this._controller; }

  public get entryItem(): TimelogEntryItem { return this._controller.currentlyOpenTLEFItem.item.getInitialTLEValue(); }

  constructor() { }

  ngOnInit() {
  }

}
