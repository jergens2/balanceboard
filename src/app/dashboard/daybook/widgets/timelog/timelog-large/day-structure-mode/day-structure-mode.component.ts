import { Component, OnInit, OnDestroy } from '@angular/core';
import { DayStructureChartLabelLine } from './chart-label-line.class';
import { DayTemplatesService } from '../../../../../scheduling/day-templates/day-templates.service';
import * as moment from 'moment';
import { DayStructureTimeColumnRow } from './time-column-row.class';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-day-structure-mode',
  templateUrl: './day-structure-mode.component.html',
  styleUrls: ['./day-structure-mode.component.css']
})
export class DayStructureModeComponent implements OnInit, OnDestroy {

  constructor(private dayTemplateService: DayTemplatesService) { }


  private timeColumnRows: DayStructureTimeColumnRow[] = [];
  private finalTimeColumnRow: DayStructureTimeColumnRow;
  private chartLabelLines: DayStructureChartLabelLine[] = [];


  ngOnInit() {
    this.buildChartLabelLines();
    this.buildTimeColumnRows();
    this.configureChart();
  }


  private _chartConfiguration: any = {};
  public get chartConfiguration(): any { return this._chartConfiguration; };
  private configureChart() {
    this._chartConfiguration = {
      minutesPerDivision: 10,
      timeColumnRows: this.timeColumnRows,
      chartLabelLines: this.chartLabelLines,
      finalTimeColumnRow: this.finalTimeColumnRow,
    };

  }

  private _cursorPosition$: BehaviorSubject<DayStructureTimeColumnRow> = new BehaviorSubject(null);
  public get cursorPosition$(): Observable<DayStructureTimeColumnRow> {
    return this._cursorPosition$.asObservable();
  }
  public get cursorPosition(): DayStructureTimeColumnRow {
    return this._cursorPosition$.getValue();
  }




  private _chartAction: string = "";
  public onMouseEnterNewChartLineArea() {
    this._chartAction = "new";
    this.updateElements();
  }
  public onMouseLeaveNewChartLineArea() {
    this.updateElements();
  }
  public onMouseEnterMoveChartLineArea() {
    this._chartAction = "move";
    this.updateElements();
  }
  public onMouseLeaveMoveChartLineArea() {
    this.updateElements();
  }
  public onMouseLeaveChart() {
    this._chartAction = "";
    this._activelyDraggingLine = null;
    this.updateElements();
  }





  private buildChartLabelLines() {
    let chartLabelLines: DayStructureChartLabelLine[] = [];
    let initial: DayStructureChartLabelLine = new DayStructureChartLabelLine(moment().startOf("day"), moment().hour(7).minute(30).second(0).millisecond(0), "Sleeping", "Start of day");
    let awake: DayStructureChartLabelLine = new DayStructureChartLabelLine(moment().hour(7).minute(30).second(0).millisecond(0), moment().hour(22).minute(30).second(0).millisecond(0), "Awake", "Wake Up");
    let sleep: DayStructureChartLabelLine = new DayStructureChartLabelLine(moment().hour(22).minute(30).second(0).millisecond(0), moment().endOf("day"), "Sleeping", "Bed Time");
    let final: DayStructureChartLabelLine = new DayStructureChartLabelLine(moment().endOf("day"), moment().endOf("day"), "", "End of day");
    awake.setAsDraggable();
    sleep.setAsDraggable();
    chartLabelLines = [
      initial,
      awake,
      sleep,
      final,
    ];
    this.chartLabelLines = chartLabelLines;
  }


  private buildTimeColumnRows() {
    let timeColumnRows: DayStructureTimeColumnRow[] = [];
    let timeColumnRowMax: number = 96; // 5 minute segments;
    // NOTE:  if this variable value is changes, the value in the .css file also needs to be changed for this grid.
    // let timeColumnRowMax: number = 96; // 15 minute segments
    for (let i = 0; i < timeColumnRowMax; i++) {
      let timeColumnRow: DayStructureTimeColumnRow = new DayStructureTimeColumnRow(i, timeColumnRowMax);
      timeColumnRows.push(timeColumnRow);
    }

    timeColumnRows.forEach((timeColumnRow) => {
      timeColumnRow.mouseDown$.subscribe((mouseDown) => {
        if (mouseDown === true) {
          this.startDragging(timeColumnRow);
        }
      });
      timeColumnRow.dragging$.subscribe((dragging) => {
        this.dragging(timeColumnRow);
      });
      timeColumnRow.mouseUp$.subscribe((mouseUp) => {
        this.stopDragging(timeColumnRow);
      });
    });

    this.timeColumnRows = timeColumnRows;
    this.updateElements();
    this.finalTimeColumnRow = new DayStructureTimeColumnRow(timeColumnRowMax, timeColumnRowMax);
    console.log("final coluasdasdsa", this.finalTimeColumnRow)
  }


  private _activelyDraggingLine: DayStructureChartLabelLine;
  public get currentlyDragging(): boolean{
    return this._activelyDraggingLine != null;
  }
  private startDragging(timeColumnRow: DayStructureTimeColumnRow) {
    this._activelyDraggingLine = this.determineChartLabelLine(timeColumnRow);
    this.updateCursorPosition(timeColumnRow);
  }
  private dragging(timeColumnRow: DayStructureTimeColumnRow) {
    if (this._activelyDraggingLine) {
      this.updateCursorPosition(timeColumnRow);
      this.updateChartLabelLines();
    }
  }
  private stopDragging(timeColumnRow: DayStructureTimeColumnRow) {
    if (this._activelyDraggingLine) {
      this.updateCursorPosition(timeColumnRow);
    }
    this.updateElements();
  }

  private determineChartLabelLine(timeColumnRow: DayStructureTimeColumnRow): DayStructureChartLabelLine {
    return this.chartLabelLines.find((chartLabelLine) => {
      return chartLabelLine.startTime.isSame(timeColumnRow.startTime);
    });
  }


  private _cursorPosition: DayStructureTimeColumnRow;
  private updateCursorPosition(timeColumnRow: DayStructureTimeColumnRow) {
    this._cursorPosition = timeColumnRow;
    if (this._activelyDraggingLine) {
      let isTwelve: boolean = this._cursorPosition.startTime.hour() == 0 && this._cursorPosition.startTime.minute() == 0;
      if(!isTwelve){
        this._activelyDraggingLine.movePosition(this._cursorPosition);
      }
      
    }
  }


  private updateElements() {
    this.updateChartLabelLines();
    this.updateTimeColumnRows();
  }

  private updateChartLabelLines(){
    this.chartLabelLines = this.chartLabelLines.sort((line1, line2)=>{
      if(line1.startTime.isBefore(line2.startTime)){
        return -1;
      }
      if(line1.startTime.isAfter(line2.startTime)){
        return 1;
      }
      return 0;
    });
    for(let i=0; i< this.chartLabelLines.length; i++ ){
      if(i < this.chartLabelLines.length-1 ){
        this.chartLabelLines[i].endTime = moment(this.chartLabelLines[i+1].startTime);
      }
    }
  }
  private updateTimeColumnRows(){
    this.timeColumnRows.forEach((timeColumnRow) => {
      timeColumnRow.setDoesNotHaveChartLabelLine();
      this.chartLabelLines.forEach((chartLabelLine) => {
        if (timeColumnRow.startTime.isSame(chartLabelLine.startTime) && chartLabelLine.canDrag) {
          timeColumnRow.setHasChartLabelLine();
        }
      });
    });
    this._activelyDraggingLine = null;
  }




  private addChartLine(timeColumnRow: DayStructureTimeColumnRow) {
    let chartLabelLines = Object.assign([], this.chartLabelLines);

    let newChartLine = timeColumnRow.chartLabel;
    chartLabelLines.push(newChartLine);

    chartLabelLines = chartLabelLines.sort((line1: DayStructureChartLabelLine, line2: DayStructureChartLabelLine) => {
      // if(!line1.canDrag){
      //   return -1;
      // }
      if (line1.startTime.isBefore(line2.startTime)) {
        return -1;
      }
      if (line1.startTime.isAfter(line2.startTime)) {
        return 1;
      }
      return 0;
    });

    if (!this.verifyChartLabelLines(chartLabelLines)) {
      // console.log("Error with chart label lines");
    }
    this.chartLabelLines = chartLabelLines;
  }
  private removeChartLine(timeColumnRow: DayStructureTimeColumnRow) {
    let foundLine = this.chartLabelLines.find((labelLine) => {
      return labelLine.isTemporary && labelLine.startTime.isSame(timeColumnRow.startTime);
    });
    if (foundLine) {
      this.chartLabelLines.splice(this.chartLabelLines.indexOf(foundLine), 1);
    }
  }

  private verifyChartLabelLines(chartLabelLines: DayStructureChartLabelLine[]): boolean {

    return false;
  }

  ngOnDestroy() {

  }

}
