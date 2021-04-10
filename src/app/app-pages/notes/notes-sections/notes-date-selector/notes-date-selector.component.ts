import { Component, OnDestroy, OnInit } from '@angular/core';
import { NoteHttpService } from '../../api/note-http.service';
import * as moment from 'moment';
import { NotebookEntry } from '../../notebook-entry/notebook-entry.class';
import { NotesDate } from './notes-date.class';
import { NotesMonth } from './notes-month/notes-month.class';
import { AppScreenSizeService } from 'src/app/shared/app-screen-size/app-screen-size.service';
import { Subscription } from 'rxjs';
import { NotesDateView } from './notes-date-view.enum';
import { ButtonMenu } from 'src/app/shared/components/button-menu/button-menu.class';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-notes-date-selector',
  templateUrl: './notes-date-selector.component.html',
  styleUrls: ['./notes-date-selector.component.css']
})
export class NotesDateSelectorComponent implements OnInit, OnDestroy {

  constructor(private noteService: NoteHttpService, private sizeService: AppScreenSizeService) { }


  private _months: NotesMonth[] = [];
  private _notesDates: NotesDate[] = [];
  private _ngClassYearGrid: string[] = [];
  private _monthWidth: number;

  private _view: NotesDateView = NotesDateView.YEAR;
  private _viewButtonMenu: ButtonMenu;

  private _subscriptions: Subscription[] = [];
  private _dayActionSubscriptions: Subscription[] = [];

  private _searchList: NotebookEntry[] = [];


  private _monthViewStartYYYYMMDD: string = '';
  private _yearViewStartYYYYMMDD: string = '';
  private _yearsViewStartYYYYMMDD: string = '';

  private _filterStartDateYYYYMMDD: string = '';
  private _filterEndDateYYYYMMDD: string = '';

  public get months(): NotesMonth[] { return this._months; }
  public get days(): NotesDate[] { return this._notesDates; }
  public get ngClassYearGrid(): string[] { return this._ngClassYearGrid; }
  public get monthWidth(): number { return this._monthWidth; }

  public get searchList(): NotebookEntry[] { return this._searchList; }
  public get showSearchList(): boolean { return this._searchList.length > 0; }

  public get filterStartDateYYYYMMDD(): string { return this._filterStartDateYYYYMMDD; }
  public get filterEndDateYYYYMMDD(): string { return this._filterEndDateYYYYMMDD; }
  public get filterStartDateIsEnd(): boolean { return this.filterStartDateYYYYMMDD === this.filterEndDateYYYYMMDD; }

  public get yearsViewStartYYYYMMDD(): string { return this._yearsViewStartYYYYMMDD; }


  public get view(): NotesDateView { return this._view; }
  public get viewIsMonth(): boolean { return this.view === NotesDateView.MONTH; }
  public get viewIsYear(): boolean { return this.view === NotesDateView.YEAR; }
  public get viewIsYears(): boolean { return this.view === NotesDateView.MULTI_YEAR; }

  public get viewButtonMenu(): ButtonMenu { return this._viewButtonMenu; }

  public get faAngleDown() { return faAngleDown; }
  public get faAngleUp() { return faAngleUp; }


  ngOnInit(): void {
    this._buildViewMenu();
    this._setGrid();
    this._subscriptions = [
      this.sizeService.width$.subscribe(() => this._setGrid()),
    ];
    this.viewButtonMenu.openItem('Year');
  }

  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._dayActionSubscriptions.forEach(s => s.unsubscribe());
  }

  public onMonthClicked(monthStartYYYYMMDD: string) {
    this._monthViewStartYYYYMMDD = monthStartYYYYMMDD;
    this.viewButtonMenu.openItem('Month');
  }

  public onClickUp(){
    if(this.viewIsMonth){
      if(this._monthViewStartYYYYMMDD){
        this._monthViewStartYYYYMMDD = moment(this._monthViewStartYYYYMMDD).subtract(1, 'month').format('YYYY-MM-DD');
      }
      this.viewButtonMenu.openItem('Month');
    }else if(this.viewIsYear){
      if(this._yearViewStartYYYYMMDD){
        this._yearViewStartYYYYMMDD = moment(this._yearViewStartYYYYMMDD).subtract(1, 'year').format('YYYY-MM-DD');
      }
      this.viewButtonMenu.openItem('Year');
    }else if(this.viewIsYears){
      if(this._yearsViewStartYYYYMMDD){
        this._yearsViewStartYYYYMMDD = moment(this._yearsViewStartYYYYMMDD).subtract(1, 'year').format('YYYY-MM-DD');
      }
      this.viewButtonMenu.openItem('Years');
    }
  }
  public onClickDown(){
    if(this.viewIsMonth){
      if(this._monthViewStartYYYYMMDD){
        this._monthViewStartYYYYMMDD = moment(this._monthViewStartYYYYMMDD).add(1, 'month').format('YYYY-MM-DD');
      }
      this.viewButtonMenu.openItem('Month');
    }else if(this.viewIsYear){
      if(this._yearViewStartYYYYMMDD){
        this._yearViewStartYYYYMMDD = moment(this._yearViewStartYYYYMMDD).add(1, 'year').format('YYYY-MM-DD');
      }
      this.viewButtonMenu.openItem('Year');
    }else if(this.viewIsYears){
      if(this._yearsViewStartYYYYMMDD){
        this._yearsViewStartYYYYMMDD = moment(this._yearsViewStartYYYYMMDD).add(1, 'year').format('YYYY-MM-DD');
      }
      this.viewButtonMenu.openItem('Years');
    }
  }

  private _buildViewMenu() {
    this._view = NotesDateView.YEAR;
    this._viewButtonMenu = new ButtonMenu();
    this._viewButtonMenu.addItem$('Month').subscribe(() => this._openMonthView());
    this._viewButtonMenu.addItem$('Year').subscribe(() => this._openYearView());
    this._viewButtonMenu.addItem$('Years').subscribe(() => this._openMultiYearView());
  }

  private _openYearView() {
    if(!this._yearViewStartYYYYMMDD){
      this._yearViewStartYYYYMMDD = moment().startOf('month').subtract(11, 'months').format('YYYY-MM-DD');
    }
    this._filterStartDateYYYYMMDD = moment(this._yearViewStartYYYYMMDD).format('YYYY-MM-DD');
    this._filterEndDateYYYYMMDD = moment(this._yearViewStartYYYYMMDD).add(11, 'months').endOf('month').format('YYYY-MM-DD');
    this._buildNotesDates(this._filterStartDateYYYYMMDD, this._filterEndDateYYYYMMDD);
    this._executeQuery(this._filterStartDateYYYYMMDD, this._filterEndDateYYYYMMDD);
    this._view = NotesDateView.YEAR
  }
  private _openMultiYearView() {
    if(!this._yearsViewStartYYYYMMDD){
      this._yearsViewStartYYYYMMDD = moment().startOf('year').subtract(2, 'years').format('YYYY-MM-DD');
    }
    this._filterStartDateYYYYMMDD = moment(this._yearsViewStartYYYYMMDD).format('YYYY-MM-DD');
    this._filterEndDateYYYYMMDD = moment(this._yearsViewStartYYYYMMDD).add(2, 'years').endOf('year').format('YYYY-MM-DD');
    this._buildNotesDates(this._filterStartDateYYYYMMDD, this._filterEndDateYYYYMMDD);
    this._executeQuery(this._filterStartDateYYYYMMDD, this._filterEndDateYYYYMMDD);
    this._view = NotesDateView.MULTI_YEAR
  }

  private _openMonthView() {
    if (!this._monthViewStartYYYYMMDD) {
      this._monthViewStartYYYYMMDD = moment().startOf('month').format('YYYY-MM-DD');
    }
    this._filterStartDateYYYYMMDD = moment(this._monthViewStartYYYYMMDD).startOf('month').format('YYYY-MM-DD');
    this._filterEndDateYYYYMMDD = moment(this._monthViewStartYYYYMMDD).endOf('month').format('YYYY-MM-DD');
    this._buildNotesDates(this._filterStartDateYYYYMMDD, this._filterEndDateYYYYMMDD);
    this._executeQuery(this._filterStartDateYYYYMMDD, this._filterEndDateYYYYMMDD);
    this._view = NotesDateView.MONTH;
  }

  private _setGrid() {
    const width = this.sizeService.maxComponentWidthPX;
    const minMonthWidth = 225;
    let columns = Math.floor(width / minMonthWidth);
    if (columns <= 1) {
      this._ngClassYearGrid = ['one-by-twelve'];
    } else if (columns === 2) {
      this._ngClassYearGrid = ['two-by-six'];
    } else if (columns === 3) {
      this._ngClassYearGrid = ['three-by-four'];
    } else if (columns === 4 || columns === 5) {
      this._ngClassYearGrid = ['four-by-three'];
    } else if (columns >= 6) {
      this._ngClassYearGrid = ['six-by-two'];
    }
  }

  private _buildNotesDates(startDateYYYYMMDD: string, endDateYYYYMMDD: string) {
    const allNotes = this.noteService.allNotes;
    let currentDateYYYYMMDD: string = startDateYYYYMMDD;
    const filteredNotes = allNotes.filter(item => {
      return item.journalDateYYYYMMDD >= startDateYYYYMMDD && item.journalDateYYYYMMDD <= endDateYYYYMMDD;
    });
    const notesDates: NotesDate[] = [];
    let mostNotesPerDay: number = 0;
    let mostWordsPerDay: number = 0;
    while (currentDateYYYYMMDD <= endDateYYYYMMDD) {
      const dateNotes: NotebookEntry[] = filteredNotes.filter(item => item.journalDateYYYYMMDD === currentDateYYYYMMDD);
      const noteDate: NotesDate = new NotesDate(currentDateYYYYMMDD, dateNotes);
      notesDates.push(noteDate);
      if (noteDate.wordCount > mostWordsPerDay) {
        mostWordsPerDay = noteDate.wordCount;
      }
      if (noteDate.notesCount > mostNotesPerDay) {
        mostNotesPerDay = noteDate.notesCount;
      }
      currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
    }
    let currentMonthYYYYMMDD: string = startDateYYYYMMDD;
    const notesMonths: NotesMonth[] = [];
    while (currentMonthYYYYMMDD <= endDateYYYYMMDD) {
      let monthStartYYYYMMDD: string = currentMonthYYYYMMDD;
      let endOfMonthYYYYMMDD: string = moment(currentMonthYYYYMMDD).endOf('month').format('YYYY-MM-DD');
      const monthNoteDates = notesDates.filter(item => item.dateYYYYMMDD >= monthStartYYYYMMDD && item.dateYYYYMMDD <= endOfMonthYYYYMMDD);
      notesMonths.push(new NotesMonth(monthStartYYYYMMDD, monthNoteDates));
      currentMonthYYYYMMDD = moment(currentMonthYYYYMMDD).add(1, 'months').format('YYYY-MM-DD');
    }
    notesMonths.forEach(notesMonth => notesMonth.setScales(mostNotesPerDay, mostWordsPerDay));
    this._months = notesMonths;
    this._notesDates = notesDates;
    this._dayActionSubscriptions.forEach(s => s.unsubscribe());
    this._months.forEach(month => {
      month.days.forEach(day => {
        this._dayActionSubscriptions.push(day.mouseDown$.subscribe(() => { this._mouseDown(day) }));
        this._dayActionSubscriptions.push(day.mouseOver$.subscribe(() => { this._mouseOver(day) }));
        this._dayActionSubscriptions.push(day.mouseUp$.subscribe(() => { this._mouseUp(day) }));
      })
    });

  }

  private _dayDown: NotesDate;
  private _dayOver: NotesDate;
  private _dayUp: NotesDate;

  public get isDragging(): boolean { return this._dayDown !== null; }
  private _mouseDown(day: NotesDate) {
    this.months.forEach(m => m.setDatesInactive());
    this._dayDown = day;

  }
  private _mouseOver(day: NotesDate) {
    if (this._dayDown) {
      this._dayOver = day;
      this.months.forEach(m => m.stopDragging());
      if (this._dayDown.date.isBefore(this._dayOver.date)) {
        this.months.forEach(m => m.dragDays(this._dayDown, this._dayOver));
      } else {
        this.months.forEach(m => m.dragDays(this._dayOver, this._dayDown));
      }
    }
  }
  private _mouseUp(day: NotesDate) {
    if (this._dayDown) {
      this._dayUp = day;
      if (this._dayUp.date.isAfter(this._dayDown.date)) {
        this._executeQueryByNotesDates(this._dayDown, this._dayUp);
      } else {
        this._executeQueryByNotesDates(this._dayUp, this._dayDown);
      }
    }
    this._stopDragging();
  }

  private _executeQueryByNotesDates(startDay: NotesDate, endDay: NotesDate) {
    this._months.forEach(month => month.setDatesActive(startDay, endDay));
    this._executeQuery(startDay.dateYYYYMMDD, endDay.dateYYYYMMDD);
  }


  private _executeQuery(startDateYYYYMMDD: string, endDateYYYYMMDD: string) {
    this._filterStartDateYYYYMMDD = startDateYYYYMMDD;
    this._filterEndDateYYYYMMDD = endDateYYYYMMDD

    // console.log("All notes from start date to end date:  " + startDateYYYYMMDD + " -  " + endDateYYYYMMDD);

    let queryDays: NotesDate[] = [];
    this.months.forEach(month => {
      let resultDays = month.days.filter(day => {
        return (!day.isBlankDay) && (day.dateYYYYMMDD >= startDateYYYYMMDD && day.dateYYYYMMDD <= endDateYYYYMMDD);
      });
      resultDays.forEach(rd => queryDays.push(rd));
    });

    let notesSearchList: NotebookEntry[] = [];
    queryDays.forEach(day => {
      day.notes.forEach(note => notesSearchList.push(note));
    });
    this._searchList = notesSearchList;
  }

  public onMouseLeave() { this._stopDragging(); }
  public onMouseUp() { this._stopDragging(); }

  private _stopDragging() {
    this.months.forEach(month => month.stopDragging());
    this._dayDown = null;
    this._dayOver = null;
    this._dayUp = null;
  }
}
