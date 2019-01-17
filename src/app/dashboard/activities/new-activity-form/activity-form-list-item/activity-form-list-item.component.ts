import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CategorizedActivity } from '../../categorized-activity.model';

@Component({
  selector: 'app-activity-form-list-item',
  template: `<div class="pl-4">
              <div class="parent-category-choice" (click)="onClickSelectedCategory(activity)" >{{activity.name}}</div>
              <div *ngFor="let childActivity of activity.children" >
                <app-activity-list-item [activity]="childActivity" (categoryClicked)="onClickSelectedCategory($event)"></app-activity-list-item>
              </div>
            </div>`,
  styles: [
            `.parent-category-choice{
                padding: 3px;
            }
            .parent-category-choice:hover{
                cursor: pointer;
                background-color: rgb(224, 224, 241);
            }`
          ]
})
export class ActivityFormListItemComponent implements OnInit {

  constructor() { }

  @Input() activity: CategorizedActivity;
  @Output() categoryClicked: EventEmitter<CategorizedActivity> = new EventEmitter<CategorizedActivity>();

  ngOnInit() {
  }

  onClickSelectedCategory(activity: CategorizedActivity){
    this.categoryClicked.emit(activity);
  }

}
