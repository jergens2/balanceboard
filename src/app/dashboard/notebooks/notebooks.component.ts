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
    this.tagFilters.push({
      tag: "No tag",
      isChecked: true,
      count: 0,
    })
    tags.forEach((tag) => {

      let alreadyContains: boolean = false;
      this.tagFilters.forEach((tagFilter) => {

        if (tagFilter.tag == tag) {
          alreadyContains = true;
          tagFilter.count += 1;
        }

      });
      if (!alreadyContains) {
        this.tagFilters.push({
          tag: tag,
          count: 1,
          isChecked: true,
        })
      }


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
