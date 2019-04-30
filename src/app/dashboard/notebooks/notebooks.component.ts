import { Component, OnInit } from '@angular/core';
import { NotebookEntry } from './notebook-entry/notebook-entry.model';
import { NotebooksService } from './notebooks.service';
import { ITagFilter } from './tag-filter.interface';
import { faCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';

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

  ngOnInit() {



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

    })
  }

  private updateTags(tags: string[]) {

    this.tagFilters = [];

    tags.forEach((tag) => {
      this.tagFilters.push({
        tag: tag,
        isChecked: false,
      })
    })
    this.tagFilters.push({
      tag: "No tag",
      isChecked: true,
    })
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
          }
        })
      }

      if (notebookEntry.tags.length == 1) {
        if (notebookEntry.tags[0] == "") {
          this.tagFilters.forEach((tagFilter) => {
            if (tagFilter.tag == "No tag" && tagFilter.isChecked) {
              filteredEntries.push(notebookEntry);
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

}
