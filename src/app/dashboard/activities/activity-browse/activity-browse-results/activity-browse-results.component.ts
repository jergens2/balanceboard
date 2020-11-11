import { Component, Input, OnInit } from '@angular/core';
import { ActivitySearchResult } from '../../../../shared/activity-search/activity-search-result.interface';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';

@Component({
  selector: 'app-activity-browse-results',
  templateUrl: './activity-browse-results.component.html',
  styleUrls: ['./activity-browse-results.component.css']
})
export class ActivityBrowseResultsComponent implements OnInit {

  constructor() { }

  @Input() public set searchResults(results: ActivitySearchResult[]) {
    this._searchResults = results; 
  }
  public get searchResults(): ActivitySearchResult[] { return this._searchResults; }
  private _searchResults: ActivitySearchResult[] = [];


  ngOnInit(): void {
  }

}
