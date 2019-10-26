import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from './timelog-entry-item.class';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { RelativeMousePosition } from '../../../../../../../shared/utilities/relative-mouse-position.class';
import { ToolsService } from '../../../../../../../tools-menu/tools/tools.service';
import { ToolComponents } from '../../../../../../../tools-menu/tools/tool-components.enum';

@Component({
  selector: 'app-timelog-entry',
  templateUrl: './timelog-entry.component.html',
  styleUrls: ['./timelog-entry.component.css']
})
export class TimelogEntryComponent implements OnInit {

  constructor(private toolsService: ToolsService) { }

  private _entry: TimelogEntryItem;
  private _minutesPerTwentyPixels: number;
  @Input() public set entry(item: TimelogEntryItem){
    this._entry = item;
  }
  @Input() public set minutesPerTwentyPixels(minutesPerTwentyPixels: number){
    this._minutesPerTwentyPixels = minutesPerTwentyPixels;
  }
  public get minutesPerTwentyPixels(): number { return this._minutesPerTwentyPixels; };
  public get entry(): TimelogEntryItem{ return this._entry;}
  public get mouseIsOver(): boolean { return this._entry.itemState.mouseIsOver; }
  // public get elementHeight(): number { return this._relativeMousePosition.elementHeight; }
  public get showNewTimelogEntryButton(): boolean { 
    return this.mouseIsOver && this.entry.sleepState === 'AWAKE' && !this._entry.isSavedEntry;
  }

  ngOnInit() {
    
  }

  // private _relativeMousePosition: RelativeMousePosition = new RelativeMousePosition();

  public onMouseEnter(event: MouseEvent) {
    // this._relativeMousePosition.onMouseMove(event, "timelog-entry-root");
    this._entry.itemState.onMouseEnter();
    // console.log(this._entry.sleepState);
  }

  public onClickTimelogEntry(){
    console.log("opening tool for entry: ", this._entry)
    this.toolsService.openTool(ToolComponents.TimelogEntry, this._entry);
  }


  public onClickNewTimelogEntry(){
    this.toolsService.openTool(ToolComponents.TimelogEntry, this._entry);
  }



  faPlusCircle = faPlusCircle;

}
