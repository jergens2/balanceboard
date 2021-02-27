import { Component, Input, OnInit } from '@angular/core';
import { AppScreenSizeService } from 'src/app/shared/app-screen-size/app-screen-size.service';
import { NoteGroup } from './note-group.interface';
import * as moment from 'moment';

@Component({
  selector: 'app-note-group',
  templateUrl: './note-group.component.html',
  styleUrls: ['./note-group.component.css']
})
export class NoteGroupComponent implements OnInit {

  constructor(private sizeService: AppScreenSizeService) { }

  @Input() public noteGroup: NoteGroup;

  public get noNotesSameDate(): boolean {
    return this.noteGroup.dateYYYYMMDD === this.noteGroup.noNotesEndDateYYYYMMDD;
  }

  ngOnInit(): void {
  }

  public get isNotSmall(): boolean { return !this.sizeService.isSmall; }
  public get isNotToday(): boolean {
    return this.noteGroup.dateYYYYMMDD !== moment().format('YYYY-MM-DD');
  }

}
