import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DataEntryItemType } from './data-entry-item-type.enum';
import { DataEntryInput } from './data-entry-input.class';
import { faListUl, faDollarSign, faSortNumericUpAlt, faCheck, faWeight, faAppleAlt, faTable } from '@fortawesome/free-solid-svg-icons';
import { faBell, faClock, faSmile } from '@fortawesome/free-regular-svg-icons';
import { Subject, Observable } from 'rxjs';
import { DaybookDisplayService } from '../../dashboard/daybook/daybook-display.service';

@Component({
  selector: 'app-data-entry-item-input',
  templateUrl: './data-entry-item-input.component.html',
  styleUrls: ['./data-entry-item-input.component.css']
})
export class DataEntryItemInputComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService) { }

  inputItemTypes: DataEntryInput[] = []; 

  public get activeInputComponent(): DataEntryInput{
    return this.inputItemTypes.find((item)=>{
      return item.isActive;
    });
  }

  @Output() close: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
    // We are currently only implementing 9 out of 11 data types.

    const timelogEntryItem: DataEntryInput = new DataEntryInput(DataEntryItemType.TimelogEntry, faTable, "Timelog Entry");
    this.inputItemTypes = [
      timelogEntryItem,
      new DataEntryInput(DataEntryItemType.FinancialEntry, faDollarSign, "Financial Item"),
      new DataEntryInput(DataEntryItemType.ActionItemEntry, faCheck, "Action Item"),
      new DataEntryInput(DataEntryItemType.ReminderEntry, faBell, "Reminder"),
      new DataEntryInput(DataEntryItemType.ScheduledEventEntry, faClock, "Scheduled Event"),
      new DataEntryInput(DataEntryItemType.DietaryEntry, faAppleAlt, "Dietary Entry"),
      new DataEntryInput(DataEntryItemType.FeelingEntry, faSmile, "Feeling Entry"),
      new DataEntryInput(DataEntryItemType.WeightlogEntry, faWeight, "Weightlog Entry"),
      new DataEntryInput(DataEntryItemType.CountEntry, faSortNumericUpAlt, "Take Count of Something"),
    ];

    this.onClickInputItem(timelogEntryItem);
  }


  private _currentInputType: DataEntryItemType = DataEntryItemType.TimelogEntry;
  public inputTypeIs(checkType: DataEntryItemType): boolean{
    if(this._currentInputType === checkType){
      return true;
    }else{
      return false;
    }
  }
  public onClickInputItem(item: DataEntryInput) {
    this._currentInputType = item.dataType;
    this.inputItemTypes.forEach((inputItem)=>{
      if(inputItem.dataType === this._currentInputType){
        inputItem.isActive = true;
      }else{
        inputItem.isActive = false;
      }
    })
  }

  public onClickSave(){

    // this.activeInputComponent.saveDataEntry();
    this._onClickSave$.next(true);
    this.close.emit(true);
  }

  private _onClickSave$: Subject<boolean> = new Subject();
  public get onClickSave$(): Observable<boolean>{
    return this._onClickSave$.asObservable();
  }

  private _onCloseInputTool$: Subject<boolean> = new Subject();
  public get onCloseInputTool$(): Observable<boolean> {
    return this._onCloseInputTool$.asObservable();
  }


}
