import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons';
import { NotebookEntry } from '../notebook-entry/notebook-entry.class';
import { NotebooksService } from '../notebooks.service';


@Component({
  selector: 'app-notebook-tags',
  templateUrl: './notebook-tags.component.html',
  styleUrls: ['./notebook-tags.component.css']
})
export class NotebookTagsComponent implements OnInit {

  faCircle = faCircle;
  faCheckCircle = faCheckCircle;

  constructor(private notebooksService: NotebooksService) { }

  tagFilters: any[];
  @Output() notesFiltered: EventEmitter<NotebookEntry[]> = new EventEmitter();


  private _allNotebookEntries: NotebookEntry[] = [];

  ngOnInit() {
    this.notebooksService.tags$.subscribe((tags: string[]) => {
      this.updateTags(tags);
    })
    this.updateTags(this.notebooksService.tags);
    this.notebooksService.notebookEntries$.subscribe((entries: NotebookEntry[]) => {
      if (entries.length > 0) {
        this._allNotebookEntries = entries;
  
      }
    });
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

  onClickTagCheck(tagFilter: any) {
    tagFilter.isChecked = !tagFilter.isChecked;

    this.filterNotebookEntries();
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

    this.notesFiltered.emit(filteredEntries);
  }

}
