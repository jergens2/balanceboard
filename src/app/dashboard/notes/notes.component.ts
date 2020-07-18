import { Component, OnInit } from '@angular/core';
import { NotebookEntry } from './notebook-entry/notebook-entry.model';
import { NotebooksService } from './notebooks.service';
import { ITagFilter } from './tag-filter.interface';
import { YearViewData } from '../../shared/time-views/year-view/year-view-data.interface';
import { YearViewDataType } from '../../shared/time-views/year-view/year-view-data-type.enum';
import * as moment from 'moment';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCog, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {

  faCog: IconDefinition = faCog;
  faHashtag = faHashtag;
  faCalendarAlt = faCalendarAlt;


  constructor(private notebooksService: NotebooksService) { }

  private _isLoading: boolean = true;
  private _allNotebookEntries: NotebookEntry[] = [];

  public get isLoading(): boolean { return this._isLoading; }

  filteredNotebookEntries: NotebookEntry[] = [];

  tagFilters: ITagFilter[] = [];

  yearViewData: YearViewData;

  loadingStart: moment.Moment = moment();
  loadingEnd: moment.Moment = moment();

  ngOnInit() {


    let year: number = 2019;


    this.notebooksService.fetchNotebookEntries$().subscribe((isComplete)=>{
      if(isComplete){
        this._allNotebookEntries = this.notebooksService.notebookEntries;
        this.notebooksService.notebookEntries$.subscribe((entries: NotebookEntry[]) => {
          if (entries.length > 0) {
            this._allNotebookEntries = entries;
            this.filteredNotebookEntries = this.buildFilteredNotebookEntries(entries);
          }
          this.buildYearViewData(year);
        });
        this._isLoading = false;
      }
    });
  }


  private buildFilteredNotebookEntries(entries: NotebookEntry[]): NotebookEntry[]{
    let filteredEntries: NotebookEntry[] = [];

    filteredEntries = entries.sort((entry1, entry2)=>{
      if(entry1.journalDate.isBefore(entry2.journalDate)){
        return 1;
      }
      if(entry1.journalDate.isAfter(entry2.journalDate)){
        return -1;
      }
      return 0;
    });


    // let entryLimit: number = 10;

    // filteredEntries = filteredEntries.filter((entry)=>{
    //   if(filteredEntries.indexOf(entry) < entryLimit){
    //     return entry;
    //   }
    // });

    console.log("filtered entries:", filteredEntries);
    this.loadingEnd = moment();
    console.log("Filtered Entries Loading: " + this.loadingEnd.diff(this.loadingStart, "milliseconds") + " ms")
    return filteredEntries;
  }



  private buildYearViewData(year: number){
    let notesData: {dateYYYYMMDD: string, notes: NotebookEntry[]}[] = [];
    let maxValue: number = 0;
    let options: any = { 

    }

    let startDate: moment.Moment = moment().year(year).startOf("year");
    let endDate: moment.Moment = moment(startDate).endOf('year');
    let currentDate: moment.Moment = moment(startDate);


    //this following method is about 10 times faster than the previous method of trying to find the max value.
    this._allNotebookEntries.forEach((notebookEntry)=>{
      let dataEntry = notesData.find((data)=>{
        return data.dateYYYYMMDD == notebookEntry.journalDate.format("YYYY-MM-DD");
      });
      if(dataEntry){
        dataEntry.notes.push(notebookEntry);
      }else{
        let noteData: {dateYYYYMMDD: string, notes: NotebookEntry[]} = { dateYYYYMMDD: notebookEntry.journalDate.format('YYYY-MM-DD'), notes: [notebookEntry]};
        notesData.push(noteData);
      }
    });

    console.log("notesData:", notesData);

    let yearData: { dateYYYYMMDD: string, value: number}[] = [];
    notesData.forEach((noteData)=>{
      yearData.push({
        dateYYYYMMDD: noteData.dateYYYYMMDD,
        value: noteData.notes.length,
      });
    })

    let yearViewData: YearViewData = {
      dataType: YearViewDataType.Note,
      data: yearData,
      maxValue: maxValue,
      options: options
    };
  
    this.yearViewData = yearViewData;
    // console.log("yearViewData is", yearViewData)
    this.loadingEnd = moment();
    console.log("Build year view data, Loading: " + this.loadingEnd.diff(this.loadingStart, "milliseconds") + " ms")
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
