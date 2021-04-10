import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faBookReader, faCalendarAlt, faSearch, faTags } from '@fortawesome/free-solid-svg-icons';
import { UserAccountProfileService } from '../../../user-account-profile/user-account-profile.service';

@Component({
  selector: 'app-notes-header',
  templateUrl: './notes-header.component.html',
  styleUrls: ['./notes-header.component.css']
})
export class NotesHeaderComponent implements OnInit {

  constructor(private profileService: UserAccountProfileService) { }

  public get faCalendar() { return faCalendarAlt; }
  public get faSearch() { return faSearch; }
  public get faTags() { return faTags; }
  public get faBookReader() { return faBookReader; }


  @Output() itemOpened: EventEmitter<'TAGS'|'SEARCH'|'CALENDAR' | 'READ'> = new EventEmitter();

  private _headerHeight: string = '100px'
  public get headerHeight(): string { return this._headerHeight; }


  ngOnInit(): void {
    this.itemOpened.next('READ');
  }

  public onClickHeaderItem(headerItem: 'TAGS'|'SEARCH'|'CALENDAR'|'READ'){
    this.itemOpened.next(headerItem);
  }

  public onCloseHeaderItem(){
  }

}
