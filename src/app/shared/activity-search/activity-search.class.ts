import { ActivityCategoryDefinition } from '../../dashboard/activities/api/activity-category-definition.class';
import { ActivitySearchResult } from './activity-search-result.interface';

export class ActivitySearch {
    private _results: ActivitySearchResult[];
    private _allActivities: ActivityCategoryDefinition[];
    private _searchValue: string[] = [];
    private _fullSearchValue: string = '';

    public get results(): ActivitySearchResult[] { return this._results; }

    constructor(activities: ActivityCategoryDefinition[], searchValue: string) {
        this._allActivities = activities;
        this._searchValue = searchValue.split('/');
        this._fullSearchValue = searchValue;
        this._search();
    }

    private _search() {
        const searchResultActivities: ActivityCategoryDefinition[] = [];
        this._allActivities.forEach(activity => {
            if (activity.fullNamePath.toLowerCase().indexOf(this._fullSearchValue) > -1) {
                searchResultActivities.push(activity);
            }
        });
        searchResultActivities.sort((activity1, activity2) => {
            const split1 = activity1.fullNamePathSplit;
            const split2 = activity2.fullNamePathSplit;
            const pathIndex1 = activity1.fullNamePathIndexOf(this._searchValue[0]);
            const pathIndex2 = activity2.fullNamePathIndexOf(this._searchValue[0]);
            const indexOfPathItem1 = split1[pathIndex1].indexOf(this._searchValue[0]);
            const indexOfPathItem2 = split2[pathIndex2].indexOf(this._searchValue[0]);
            if (indexOfPathItem1 === 0 && indexOfPathItem2 === 0) {
                if (pathIndex1 < pathIndex2) {
                    return -1;
                } else if (pathIndex1 > pathIndex2) {
                    return 1;
                } else {
                    return 0;
                }
            } else if (indexOfPathItem1 === 0) {
                return -1;
            } else if (indexOfPathItem2 === 0) {
                return 1;
            } else {
                if (indexOfPathItem1 < indexOfPathItem2) {
                    return -1;
                } else if (indexOfPathItem1 > indexOfPathItem2) {
                    return 1;
                } else {
                    let precedingPathName1: string = '/';
                    let precedingPathName2: string = '/';
                    for (let i = 0; i < pathIndex1; i++) {
                        precedingPathName1 += split1[i] + '/';
                    }
                    for (let i = 0; i < pathIndex2; i++) {
                        precedingPathName2 += split2[i] + '/';
                    }
                    if (precedingPathName1 < precedingPathName2) {
                        return -1;
                    } else if (precedingPathName1 > precedingPathName2) {
                        return 1;
                    } else {
                        if (activity1.fullNamePath < activity2.fullNamePath) {
                            return -1;
                        } else if (activity1.fullNamePath > activity2.fullNamePath) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                }
            }
        });

        let groupIndex = 0;
        let groupMember = 0;
        let prevItem: ActivityCategoryDefinition;

        const searchResults: ActivitySearchResult[] = [];

        for (let i = 0; i < searchResultActivities.length; i++) {
            const thisItem = searchResultActivities[i];
            if (i === 0) {
                searchResults.push({
                    activity: thisItem,
                    groupIndex: groupIndex,
                    displayString: thisItem.fullNamePathNoSlash,
                    isIndented: false,
                });
            } else {
                const pathIndex1 = prevItem.fullNamePathIndexOf(this._searchValue[0]);
                const pathIndex2 = thisItem.fullNamePathIndexOf(this._searchValue[0]);
                const split1 = prevItem.fullNamePathSplit;
                const split2 = thisItem.fullNamePathSplit;

                let precedingPathName1: string = '/';
                let precedingPathName2: string = '/';
                for (let i = 0; i <= pathIndex1; i++) {
                    precedingPathName1 += split1[i] + '/';
                }
                for (let j = 0; j <= pathIndex2; j++) {
                    precedingPathName2 += split2[j] + '/';
                }
                const neitherZero = pathIndex1 !== 0 && pathIndex2 !== 0;
                const isSameGroup = (precedingPathName1 === precedingPathName2) && neitherZero;
                if (isSameGroup) {
                    groupMember++;
                } else {
                    groupIndex++;
                    groupMember = 0;
                }
                let displayString = thisItem.fullNamePathNoSlash;
                let isIndented: boolean = false;
                if (groupMember > 0) {
                    displayString = thisItem.fullNamePath.substr(precedingPathName2.length);
                    isIndented = true;
                }
                if (displayString[displayString.length - 1] === '/') {
                    displayString = displayString.substr(0, displayString.length - 1);
                }
                searchResults.push({
                    activity: thisItem,
                    groupIndex: groupIndex,
                    displayString: displayString,
                    isIndented: isIndented,
                });
            }
            prevItem = thisItem;
        }
        this._results = searchResults;
    }

}
