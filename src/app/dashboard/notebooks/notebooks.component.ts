import { Component, OnInit } from '@angular/core';
import { NotebookEntry } from './notebook-entry/notebook-entry.model';
import { NotebooksService } from './notebooks.service';
import { ITagFilter } from './tag-filter.interface';
import { IYearViewData } from '../../shared/time-views/year-view/year-view-data.interface';
import { YearViewDataType } from '../../shared/time-views/year-view/year-view-data-type.enum';
import * as moment from 'moment';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCog, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-notebooks',
  templateUrl: './notebooks.component.html',
  styleUrls: ['./notebooks.component.css']
})
export class NotebooksComponent implements OnInit {

  faCog: IconDefinition = faCog;
  faHashtag = faHashtag;
  faCalendarAlt = faCalendarAlt;


  constructor(private notebooksService: NotebooksService) { }


  private _allNotebookEntries: NotebookEntry[] = [];


  filteredNotebookEntries: NotebookEntry[] = [];

  tagFilters: ITagFilter[] = [];

  yearViewData: IYearViewData;

  ngOnInit() {


    let year: number = 2019;




    this.notebooksService.notebookEntries$.subscribe((entries: NotebookEntry[]) => {
      if (entries.length > 0) {
        this._allNotebookEntries = entries;
        this.filteredNotebookEntries = this._allNotebookEntries;
      }
      this.buildYearViewData(year);
    });
    this._allNotebookEntries = this.notebooksService.notebookEntries;

    this.buildYearViewData(year);



  }

  private buildYearViewData(year: number){
    let notesData: {dateYYYYMMDD: string, value: any}[] = [];
    let maxValue: number = 0;
    let options: any = { 

    }

    let startDate: moment.Moment = moment().year(year).startOf("year");
    let endDate: moment.Moment = moment(startDate).endOf('year');
    let currentDate: moment.Moment = moment(startDate);

    while(currentDate.isBefore(endDate)){
      let value: number = 0;
      
      
      
      //in this current example, we are going to use the value to simply store the Count
      for(let notebookEntry of this._allNotebookEntries){
        if(notebookEntry.journalDate.format('YYYY-MM-DD') == currentDate.format('YYYY-MM-DD')){
          value++;
        }
      }
      if(value > maxValue){
        maxValue = value;
      }

      let noteData: {dateYYYYMMDD: string, value: any} = { dateYYYYMMDD: currentDate.format('YYYY-MM-DD'), value: value};
      notesData.push(noteData);
      currentDate = moment(currentDate).add(1,"days");
    }



    let yearViewData: IYearViewData = {
      dataType: YearViewDataType.Note,
      data: notesData,
      maxValue: maxValue,
      options: options
    };
  
    this.yearViewData = yearViewData;
    console.log("yearViewData is", yearViewData)
  }

  onYearViewDateClicked(day: any){
    console.log("day clicked:", day);

    let filteredEntries: NotebookEntry[] = [];
    for(let notebookEntry of this._allNotebookEntries){
      if(notebookEntry.journalDate.format('YYYY-MM-DD') == day.dayDate.format('YYYY-MM-DD')){
        filteredEntries.push(notebookEntry);
      }
    }
    this.filteredNotebookEntries = filteredEntries;
  }

  

  yearView: boolean = false;
  onClickYearView(){
    this.yearView = !this.yearView;
  }

  
  onNotesFiltered(notes: NotebookEntry[]){
    this.filteredNotebookEntries = notes;
  }
 
  tagsMenu: boolean = false;
  timeViewsMenu: boolean = false;

  onToggleTagsMenu(){
    this.tagsMenu = !this.tagsMenu;
    if(!this.tagsMenu){
      this.filteredNotebookEntries = this._allNotebookEntries;
    }
    
  }
  
  onToggleTimeViewsMenu(){
    this.timeViewsMenu = !this.timeViewsMenu;
  }

}
