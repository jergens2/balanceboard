import { Component, OnInit } from '@angular/core';
import { ActivitySearchResult } from '../../../shared/activity-search/activity-search-result.interface';
import { ActivityComponentService } from '../activity-component.service';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';

@Component({
  selector: 'app-activity-browse',
  templateUrl: './activity-browse.component.html',
  styleUrls: ['./activity-browse.component.css']
})
export class ActivityBrowseComponent implements OnInit {

  constructor(private activityService: ActivityComponentService) { }

  private _searchResults: ActivitySearchResult[] = [];
  public get searchResults(): ActivitySearchResult[] { return this._searchResults; }

  ngOnInit(): void {
    this._searchResults = this.activityService.activityTree.allActivities.sort((a1, a2) => {
      if (a1.fullNamePath < a2.fullNamePath) {
        return -1;
      } else if (a1.fullNamePath > a2.fullNamePath) {
        return 1;
      } else {
        return 0;
      }
    }).map(item => {
      return {
        activity: item,
        groupIndex: 0,
        displayString: item.fullNamePathNoSlash,
        isIndented: false,
      }
    });
  }

  public onSearchResults(results: ActivitySearchResult[]) {
    this._searchResults = results;
  }

}
