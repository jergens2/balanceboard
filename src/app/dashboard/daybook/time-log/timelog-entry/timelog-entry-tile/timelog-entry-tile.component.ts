import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment';
import { TimelogEntryTile } from './timelog-entry-tile.class';
import { Subscription } from 'rxjs';
import { IModalOption } from '../../../../../modal/modal-option.interface';
import { Modal } from '../../../../../modal/modal.model';
import { TimelogService } from '../../timelog.service';
import { ModalService } from '../../../../../modal/modal.service';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { ModalComponentType } from '../../../../../modal/modal-component-type.enum';
import { ToolsService } from '../../../../../shared/tools/tools.service';
import { ToolComponents } from '../../../../../shared/tools/tool-components.enum';

@Component({
  selector: 'app-timelog-entry-tile',
  templateUrl: './timelog-entry-tile.component.html',
  styleUrls: ['./timelog-entry-tile.component.css']
})
export class TimelogEntryTileComponent implements OnInit, OnDestroy {

  faTimes = faTimes; 
  faEdit = faEdit;
  faPlus = faPlus;

  constructor(private timelogService: TimelogService, private modalService: ModalService, private toolsService: ToolsService) { }

  @Input() tile: TimelogEntryTile;


  ngOnInit() {

  }

  ngOnDestroy(){
    this._modalSubscription.unsubscribe();
  }



  onClickSetNewTimelogEntry(tile: TimelogEntryTile) {
    this.toolsService.openTool(ToolComponents.TimelogEntry);
  }

  onClickTile(tile: TimelogEntryTile) {
    if (!tile.isLarge) {
      if (tile.isBlank) {
        this.onClickSetNewTimelogEntry(tile);
      } else {
        this.onClickTileEdit(tile);
      }
    } else {

    }
  }

  onMouseOverTile(tile: TimelogEntryTile) {
    tile.isMouseOver = true;
  }
  onMouseLeaveTile(tile: TimelogEntryTile) {
    tile.isMouseOver = false;
  }

  onClickTileEdit(tile: TimelogEntryTile) {
    this._modalSubscription.unsubscribe();
    let modal: Modal = new Modal("Timelog Entry", "", tile.timelogEntry, null, {}, ModalComponentType.TimelogEntry);
    // this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
      
    // });
    this.modalService.activeModal = modal;
  }

  private _modalSubscription: Subscription = new Subscription();
  onClickTileDelete(tile: TimelogEntryTile) {
    this._modalSubscription.unsubscribe();
    let modalOptions: IModalOption[] = [
      {
        value: "Yes",
        dataObject: null
      },
      {
        value: "No",
        dataObject: null
      }
    ];
    let modal: Modal = new Modal("Delete Time Event", "Confirm: Delete Time Event?", null, modalOptions, {}, ModalComponentType.Default);
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
      if (selectedOption.value == "Yes") {
        // try{
        //   this.timelogEntryTiles.splice(this.timelogEntryTiles.indexOf(tile));
        // }catch{

        // }
        this.timelogService.deleteTimelogEntry(tile.timelogEntry);

      } else if (selectedOption.value == "No") {

      } else {
        //error 
      }
    });
    this.modalService.activeModal = modal;
  }

  activityName(tile: TimelogEntryTile): string {
    if (moment(tile.endTime).diff(moment(tile.startTime), 'minutes') > 19) {
      if (tile.timelogEntry.tleActivities.length > 0) {
        return tile.timelogEntry.tleActivities[0].activity.name;
      } else {
        return "";
      }
    } else {
      return "";
    }

  }

  timeEventTimesString(tile: TimelogEntryTile): string {
    return ("" + tile.timelogEntry.startTime.format("h:mm a") + " - " + tile.timelogEntry.endTime.format('h:mm a'));
  }


}
