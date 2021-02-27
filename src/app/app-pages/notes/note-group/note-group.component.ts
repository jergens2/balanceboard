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
  public get ngClass(): any {
    return { 
      'padding-large': this.isFullSize, 
      'padding-medium': this.isMediumSize,
      'padding-small':this.isSmallSize,
    }
  }

  ngOnInit(): void {
  }

  public get isSmallSize(): boolean { return this.sizeService.isSmallSize; }
  public get isFullSize(): boolean { return this.sizeService.isFullSize; }
  public get isMediumSize(): boolean { return this.sizeService.isMediumSize; }
  public get isNotToday(): boolean {
    return this.noteGroup.dateYYYYMMDD !== moment().format('YYYY-MM-DD');
  }

}
