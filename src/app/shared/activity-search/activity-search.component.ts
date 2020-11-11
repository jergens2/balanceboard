import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivityHttpService } from '../../dashboard/activities/api/activity-http.service';
import { ActivityCategoryDefinition } from '../../dashboard/activities/api/activity-category-definition.class';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { ActivitySearch } from './activity-search.class';
import { ActivitySearchResult } from './activity-search-result.interface';


@Component({
  selector: 'app-activity-search',
  templateUrl: './activity-search.component.html',
  styleUrls: ['./activity-search.component.css']
})
export class ActivitySearchComponent implements OnInit {

  public faSearch = faSearch;

  @Output() searchResults: EventEmitter<ActivitySearchResult[]> = new EventEmitter();

  constructor(private activitiesService: ActivityHttpService) { }

  private _allActivities: ActivityCategoryDefinition[] = [];
  private _searchValue: string = '';
  private _resultsCount: number = 0;

  public get searchValue(): string { return this._searchValue; }
  public get resultsCount(): number { return this._resultsCount; }

  ngOnInit(): void {
    this._allActivities = this._getAllActivities();
    this._resultsCount = this._allActivities.length;
  }

  public onActivityInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      this.onInputValueChanged(event);
    }
  }
  public onActivityInputKeyUp(event: KeyboardEvent) {
    this.onInputValueChanged(event);
  }
  public onInputValueChanged(event: KeyboardEvent) {
    const target: HTMLInputElement = (event.target as HTMLInputElement);
    if (target != null && target.value != null && target.value !== '') {
      const targetValue: string = (event.target as HTMLInputElement).value;
      this._searchValue = targetValue;
      this._searchForActivities(this._searchValue.toLowerCase());
    } else {
      this._allActivities = this._getAllActivities();
      this.searchResults.next(this._allActivities.map(item => {
        return {
          activity: item,
          groupIndex: 0,
          displayString: item.fullNamePath,
          isIndented: false,
        };
      }));
      this._resultsCount = this._allActivities.length;
    }
  }

  private _getAllActivities(): ActivityCategoryDefinition[] {
    return this.activitiesService.activityTree.allActivities.sort((a1, a2) => {
      if (a1.fullNamePath < a2.fullNamePath) {
        return -1;
      } else if (a1.fullNamePath > a2.fullNamePath) {
        return 1;
      } else {
        return 0;
      }
    });
  }


  private _searchForActivities(searchValue: string) {
    searchValue = searchValue.toLowerCase();
    const searcher = new ActivitySearch(this._allActivities, searchValue);
    this.searchResults.next(searcher.results);
    this._resultsCount = searcher.results.length;
  }
}
