import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookTimelogEntryDataItem } from '../../../../../daybook-day-item/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryActivity } from '../../../../../daybook-day-item/data-items/timelog-entry-activity.interface';
import { TLEFController } from '../../TLEF-controller.class';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DaybookDisplayService } from '../../../../../daybook-display.service';

@Component({
  selector: 'app-tlef-new-or-modify',
  templateUrl: './tlef-new-or-modify.component.html',
  styleUrls: ['./tlef-new-or-modify.component.css']
})
export class TlefNewOrModifyComponent implements OnInit, OnDestroy {

  constructor(private daybookService: DaybookDisplayService) { }

  private _initialActivities: TimelogEntryActivity[] = [];
  private _textValueChangeSub: Subscription = new Subscription();
  private _entryItem: TimelogEntryItem;
  private _noteText: string = "";
  private _hasSavedNote: boolean = false;
  private _rows: number = 1;

  public get rows(): number { return this._rows; }
  public get timelogEntry(): TimelogEntryItem { return this._entryItem; }

  public get noteText(): string { return this._noteText; }

  public get initialActivities(): TimelogEntryActivity[] {
    return this._initialActivities;
  }

  private _noteFormControl: FormControl;
  public get noteFormControl(): FormControl { return this._noteFormControl; }

  ngOnInit() {
    // console.log("ONINIT")
    // console.log("from service: " )
    // console.log("thing 1: " , this.tlefService.openedTimelogEntry)
    // console.log("thing 2: " , this.tlefService.openedTimelogEntry.timelogEntryActivities);
    this._setEntryItem();
    this.daybookService.tlefController.currentlyOpenTLEFItem$.subscribe((tlefItem) => {
      if (tlefItem) {
        if (tlefItem.item.isTLEItem) {
          this._setEntryItem();
        }
      }
    });
  }
  ngOnDestroy() {
    // console.log("DESTROY")
    this._entryItem = null;
    this._initialActivities = [];
  }

  private _setEntryItem() {
    if (this.daybookService.tlefController.currentlyOpenTLEFItem) {
      this._entryItem = this.daybookService.tlefController.currentlyOpenTLEFItem.item.getInitialTLEValue();
      this._initialActivities = [];
      // console.log("Setting entry itme in NEW OR MODIFY component " , this._entryItem)
      if (this._entryItem) {
        if (this._entryItem.embeddedNote) {
          this._noteText = this._entryItem.embeddedNote;
          this._hasSavedNote = true;
        } else {
          // this._noteText = "No note";
          this._hasSavedNote = false;
        }

        if (this._entryItem.timelogEntryActivities) {
          this._entryItem.timelogEntryActivities.forEach((item) => {
            this._initialActivities.push(item);
          });
        }
      }

      this._noteFormControl = new FormControl(this._noteText);
      this._textValueChangeSub.unsubscribe();
      this._textValueChangeSub = this._noteFormControl.valueChanges.subscribe((value: any) => {
        this._checkForTextChanges(value);
      });
      const length = this._noteText.length;
      const charsPerRow = 43;
      const rows = Math.ceil(length / charsPerRow);
      this._rows = rows;
      // console.log("initial activities: " + this._initialActivities.length , this._initialActivities)
    }

  }

  public onActivitiesChanged(activities: TimelogEntryActivity[]) {
    // console.log("Activities changed: " + activities.length)
    const isSameActivities = this._sameActivities(activities, this._initialActivities);
    // const isSameText = this._initialText === this._noteFormControl.
    if (isSameActivities) {

    } else {
      this._entryItem.timelogEntryActivities = activities;
      this.daybookService.tlefController.makeChangesToTLEActivities(activities);
    }
  }


  private _checkForTextChanges(formValue: string) {
    let changesMade: boolean = false;
    if (this._noteText === formValue) {

    } else {
      changesMade = true;
      this._entryItem.embeddedNote = formValue;
      this.daybookService.tlefController.makeChangesToTLENote(formValue);
    }

  }

  private _sameActivities(array1: TimelogEntryActivity[], array2: TimelogEntryActivity[]): boolean {
    let isSame: boolean = false;
    if (array1.length === array2.length) {
      if (array1.length === 0) {
        isSame = true;
      } else {
        let allMatch: boolean = true
        array1.forEach(arrayItem => {
          if (array2.indexOf(arrayItem) === -1) {
            allMatch = false;
          }
        });
        isSame = allMatch;
      }
    }
    return isSame;
  }

}
