import { Component, OnInit } from '@angular/core';
import { NotebookEntry } from './notebook-entry/notebook-entry.model';
import { NotebooksService } from './notebooks.service';
import { ITagFilter } from './tag-filter.interface';
import { faCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { IYearViewData } from '../../shared/year-view/year-view-data.interface';
import { YearViewDataType } from '../../shared/year-view/year-view-data-type.enum';
import * as moment from 'moment';

@Component({
  selector: 'app-notebooks',
  templateUrl: './notebooks.component.html',
  styleUrls: ['./notebooks.component.css']
})
export class NotebooksComponent implements OnInit {

  constructor(private notebooksService: NotebooksService) { }


  faCircle = faCircle;
  faCheckCircle = faCheckCircle;

  private _allNotebookEntries: NotebookEntry[] = [];
  filteredNotebookEntries: NotebookEntry[] = [];

  tagFilters: ITagFilter[] = [];

  yearViewData: IYearViewData;

  ngOnInit() {


    let year: number = 2019;


    this.notebooksService.tags$.subscribe((tags: string[]) => {
      this.updateTags(tags);
    })
    this.updateTags(this.notebooksService.tags);


    this.notebooksService.notebookEntries$.subscribe((entries: NotebookEntry[]) => {
      if (entries.length > 0) {
        this._allNotebookEntries = entries;
        this.filterNotebookEntries();
        console.log("notebookEntries entries are", this._allNotebookEntries);
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

  private updateTags(tags: string[]) {

    this.tagFilters = [];
    this.tagFilters.push({
      tag: "No tag",
      isChecked: true,
      count: 0,
      style: {},
    });

    let totalCount: number = 0;
    tags.forEach((tag) => {


      let alreadyContains: boolean = false;
      this.tagFilters.forEach((tagFilter) => {

        if (tagFilter.tag == tag) {
          alreadyContains = true;
          tagFilter.count += 1;
          totalCount += 1;
        }

      });
      if (!alreadyContains) {
        this.tagFilters.push({
          tag: tag,
          count: 1,
          isChecked: true,
          style: {}
        });
        totalCount += 1;
      }


    });

    console.log("total count is", totalCount);
    let alphabeticalSort = Object.assign([], this.tagFilters);
    let countSort = Object.assign([], this.tagFilters);

    countSort.sort((tagFilter1, tagFilter2)=>{
      if(tagFilter1.count > tagFilter2.count){
        return -1;
      }
      if(tagFilter1.count < tagFilter2.count){
        return 1;
      }
      return 0;
    });
    

    let average = totalCount / countSort.length;
    let values: number[] = [];
    countSort.forEach((tagFilter)=>{
      values.push((tagFilter.count-average)*(tagFilter.count-average))
    })
    let valuesSum: number = 0;
    values.forEach((number)=>{
      valuesSum += number;
    })
    let valuesAverage: number = valuesSum / values.length;
    let standardDeviation = Math.sqrt(valuesAverage);
    console.log("Standard deviation is", standardDeviation);

    countSort.forEach((tagFilter)=>{
      let style: any = {};

      let deviation: number = 0;
      if(tagFilter.count >= average){
        deviation = (tagFilter.count-average)/standardDeviation
      }else if(tagFilter.count < average){
        deviation = (average-tagFilter.count)/standardDeviation;
      }

      if(deviation <= 1){
        style = { "font-size":"1.0em"};
      }
      if(deviation > 1 && deviation <= 2){
        style = { "font-size":"1.5em"};
      }
      if(deviation > 2 && deviation <= 3){
        style = { "font-size":"2.0em"};
      }
      if(deviation > 3 && deviation <= 4){
        style = { "font-size":"2.5em"};
      }
      if(deviation > 4 ){
        style = { "font-size":"3.0em"};
      }

      tagFilter.style = style;
    })
    

  }

  yearView: boolean = false;
  onClickYearView(){
    this.yearView = !this.yearView;
  }

  onClickTagCheck(tagFilter: ITagFilter) {
    tagFilter.isChecked = !tagFilter.isChecked;

    this.filterNotebookEntries();
  }

  private filterNotebookEntries() {
    let filteredEntries: NotebookEntry[] = [];

    for (let notebookEntry of this._allNotebookEntries) {


      if (notebookEntry.tags.length == 0) {

        this.tagFilters.forEach((tagFilter) => {
          if (tagFilter.tag == "No tag" && tagFilter.isChecked) {
            filteredEntries.push(notebookEntry);
            tagFilter.count++;
          }
        })
      }

      if (notebookEntry.tags.length == 1) {
        if (notebookEntry.tags[0] == "") {
          this.tagFilters.forEach((tagFilter) => {
            if (tagFilter.tag == "No tag" && tagFilter.isChecked) {
              filteredEntries.push(notebookEntry);
              tagFilter.count++;
            }
          })
        }
      }

      if (notebookEntry.tags.length > 0) {
        notebookEntry.tags.forEach((tag) => {
          this.tagFilters.forEach((tagFilter) => {
            if (tagFilter.tag == tag && tagFilter.isChecked) {
              if (!filteredEntries.includes(notebookEntry)) {
                filteredEntries.push(notebookEntry);
              }
            }
          });
        });
      }
    }

    this.filteredNotebookEntries = [];
    this.filteredNotebookEntries = filteredEntries;
  }


  sortAlphabetically: boolean = true;
  onClickSortTags(sortBy: string) {
    if (sortBy == "ALPHABETICALLY") {
      this.sortAlphabetically = true;
      this.tagFilters.sort((tag1, tag2) => {
        if (tag1.tag < tag2.tag) {
          return -1;
        }
        if (tag1.tag > tag2.tag) {
          return 1;
        }
        return 0;
      });
    }
    if (sortBy == "TAG_COUNT") {
      this.sortAlphabetically = false;
      this.tagFilters.sort((tag1, tag2) => {
        if (tag1.count < tag2.count) {
          return 1;
        }
        if (tag1.count > tag2.count) {
          return -1;
        }
        return 0;
      });
    }
  }

  onClickEnableAllTags() {
    this.tagFilters.forEach((tagFilter) => {
      tagFilter.isChecked = true;
    });
    this.filterNotebookEntries();
  }
  onClickDisableAllTags() {
    this.tagFilters.forEach((tagFilter) => {
      tagFilter.isChecked = false;
    });
    this.filterNotebookEntries();
  }


}
