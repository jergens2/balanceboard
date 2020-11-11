import { Component, Input, OnInit } from '@angular/core';
import { ActivitySearchResult } from '../../../../shared/activity-search/activity-search-result.interface';
import { ActivityComponentService } from '../../activity-component.service';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';

@Component({
  selector: 'app-activity-browse-results',
  templateUrl: './activity-browse-results.component.html',
  styleUrls: ['./activity-browse-results.component.css']
})
export class ActivityBrowseResultsComponent implements OnInit {

  constructor(private activityService: ActivityComponentService) { }

  @Input() public set searchResults(results: ActivitySearchResult[]) {
    this._searchResults = results;
  }
  public get searchResults(): ActivitySearchResult[] { return this._searchResults; }
  private _searchResults: ActivitySearchResult[] = [];


  ngOnInit(): void {
  }

  public onClickResult(searchResult: ActivitySearchResult) {
    this.activityService.openActivity(searchResult.activity);
  }

}
