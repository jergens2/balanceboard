import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment';
import { TimeSegmentTile } from './time-segment-tile.model';
import { ITimeSegmentFormData } from '../../time-segment-form/time-segment-form-data.interface';
import { Subscription } from 'rxjs';
import { IModalOption } from '../../../../modal/modal-option.interface';
import { Modal } from '../../../../modal/modal.model';
import { TimelogService } from '../timelog.service';
import { ModalService } from '../../../../modal/modal.service';

@Component({
  selector: 'app-time-segment-tile',
  templateUrl: './time-segment-tile.component.html',
  styleUrls: ['./time-segment-tile.component.css']
})
export class TimeSegmentTileComponent implements OnInit, OnDestroy {

  constructor(private timelogService: TimelogService, private modalService: ModalService) { }

  @Input() tile: TimeSegmentTile;
  @Output() timeSegmentFormData: EventEmitter<ITimeSegmentFormData> = new EventEmitter();

  ngOnInit() {
  }

  ngOnDestroy(){
    this._modalSubscription.unsubscribe();
  }



  onClickSetNewTimeSegment(tile: TimeSegmentTile) {
    console.log("tile is ", tile);
    let timeSegmentFormData: ITimeSegmentFormData = {
      action: 'SET',
      timeSegment: tile.timeSegment,
      date: moment(tile.timeSegment.startTime)
    }
    this.timeSegmentFormData.emit(timeSegmentFormData);
  }

  onClickTile(tile: TimeSegmentTile) {
    if (!tile.isLarge) {
      if (tile.isBlank) {
        this.onClickSetNewTimeSegment(tile);
      } else {
        this.onClickTileEdit(tile);
      }

    } else {

    }
  }

  onMouseOverTile(tile: TimeSegmentTile) {
    tile.mouseOver = true;
  }
  onMouseLeaveTile(tile: TimeSegmentTile) {
    tile.mouseOver = false;
  }

  onClickTileEdit(tile: TimeSegmentTile) {
    let timeSegmentFormData: ITimeSegmentFormData = {
      action: 'REVIEW',
      timeSegment: tile.timeSegment,
      date: moment(tile.timeSegment.startTime)
    }
    this.timeSegmentFormData.emit(timeSegmentFormData);
  }

  private _modalSubscription: Subscription = new Subscription();
  onClickTileDelete(tile: TimeSegmentTile) {
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
    let modal: Modal = new Modal("Confirm: Delete Time Event?", modalOptions, {});
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
      if (selectedOption.value == "Yes") {
        // try{
        //   this.timeSegmentTiles.splice(this.timeSegmentTiles.indexOf(tile));
        // }catch{

        // }
        this.timelogService.deleteTimeSegment(tile.timeSegment);

      } else if (selectedOption.value == "No") {

      } else {
        //error 
      }
    });
    this.modalService.activeModal = modal;
  }

}
