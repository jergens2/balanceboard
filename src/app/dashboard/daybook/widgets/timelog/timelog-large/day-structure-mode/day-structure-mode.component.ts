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

  private minutesPerDivision: number = 15;

  private _chartConfiguration: any = {};
  public get chartConfiguration(): any { return this._chartConfiguration; };
  private configureChart() {
    this._chartConfiguration = {
      minutesPerDivision: this.minutesPerDivision,
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
    this._chartAction = "";
    this.removeActiveHoveringLine();
    this.removeActiveDraggingLines();
    this.updateElements();
  }
  public onMouseEnterMoveChartLineArea() {
    this._chartAction = "move";
    this.updateElements();
  }
  public onMouseLeaveMoveChartLineArea() {
    this._chartAction = "";
    this._activelyDraggingExistingLine = null;
    this.updateElements();
  }
  public onMouseLeaveChart() {
    this._chartAction = "";
    this.removeActiveHoveringLine();
    this.removeActiveDraggingLines();
    this._activelyDraggingExistingLine = null;
    this.updateElements();
  }





  private buildChartLabelLines() {
    let chartLabelLines: DayStructureChartLabelLine[] = [];
    let initial: DayStructureChartLabelLine = new DayStructureChartLabelLine(moment().startOf("day"), moment().hour(7).minute(30).second(0).millisecond(0), "Sleeping", "Start of day", "rgba(0, 102, 255, 0.3)");
    let awake: DayStructureChartLabelLine = new DayStructureChartLabelLine(moment().hour(7).minute(30).second(0).millisecond(0), moment().hour(22).minute(30).second(0).millisecond(0), "Awake", "Wake Up", "rgba(255, 136, 0, 0.1)");
    let sleep: DayStructureChartLabelLine = new DayStructureChartLabelLine(moment().hour(22).minute(30).second(0).millisecond(0), moment().endOf("day"), "Sleeping", "Bed Time", "rgba(0, 102, 255, 0.3)");
    let final: DayStructureChartLabelLine = new DayStructureChartLabelLine(moment().endOf("day"), moment().endOf("day"), "", "End of day", "");
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

    let timeColumnRowMax: number = 1440 / this.minutesPerDivision; 

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
      timeColumnRow.mouseOvering$.subscribe((mouseovering) => {
        this.hovering(timeColumnRow);
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


  private _activelyDraggingExistingLine: DayStructureChartLabelLine;
  private _activelyHoveringNewLine: DayStructureChartLabelLine;
  private _activelyDraggingNewLine: DayStructureChartLabelLine;
  private _activelyDraggingNewLineFixed: DayStructureChartLabelLine;

  public get currentlyDragging(): boolean {
    if (this._activelyDraggingExistingLine || this._activelyDraggingNewLineFixed) {
      return true;
    }
    return false;
  }
  private startDragging(timeColumnRow: DayStructureTimeColumnRow) {
    
    if (this._chartAction == "move") {
      this._activelyDraggingExistingLine = this.determineChartLabelLine(timeColumnRow);
    } else if (this._chartAction == "new") {
      if (timeColumnRow.hasChartLabelLine) {
        this._activelyDraggingExistingLine = this.determineChartLabelLine(timeColumnRow);
      } else {
        this._activelyDraggingExistingLine = null;
        this.removeActiveHoveringLine();
        this._activelyDraggingNewLineFixed = new DayStructureChartLabelLine(timeColumnRow.startTime, timeColumnRow.startTime, "New time section", "New time delineation", "rgba(0, 68, 255, 0.15)");
        this._activelyDraggingNewLineFixed.setAsNew();
        this.chartLabelLines.push(this._activelyDraggingNewLineFixed);
        this.updateChartLabelLines();
      }
    }
  }
  private dragging(timeColumnRow: DayStructureTimeColumnRow) {

    if (this._chartAction == "move") {
      if (this._activelyDraggingExistingLine) {
        this._activelyDraggingExistingLine.movePosition(timeColumnRow);
        this.updateChartLabelLines();
      }
    } else if (this._chartAction == "new") {
      if (this._activelyDraggingExistingLine) {
        this._activelyDraggingExistingLine.movePosition(timeColumnRow);

        this.updateChartLabelLines();
      } else if (this._activelyDraggingNewLineFixed) {
        let isAfterFixed = timeColumnRow.startTime.isAfter(this._activelyDraggingNewLineFixed.startTime);
        let isBeforeNext = timeColumnRow.startTime.isBefore(this.findNextEndTime(this._activelyDraggingNewLineFixed));
        if (isAfterFixed && isBeforeNext) {
          if(!this._activelyDraggingNewLine){
            this._activelyDraggingNewLine = new DayStructureChartLabelLine(timeColumnRow.startTime, timeColumnRow.startTime, "New time section", "New time delineation", "rgb(0, 153, 255, 0.15)");
            this._activelyDraggingNewLine.setAsSecondaryNew();
            this.chartLabelLines.push(this._activelyDraggingNewLine);
            this.updateChartLabelLines();
          }else{
            this._activelyDraggingNewLine.movePosition(timeColumnRow);
          }
          this._activelyDraggingNewLineFixed.endTime = this._activelyDraggingNewLine.startTime;
        }else {
          this._activelyDraggingNewLineFixed.endTime = moment(this._activelyDraggingNewLineFixed.startTime).add(this.minutesPerDivision, "minutes");
          this.removeActiveDraggingNewLine();
          this.updateChartLabelLines();
        }
      }
    }
  }
  private stopDragging(timeColumnRow: DayStructureTimeColumnRow) {
    if (this._chartAction == "move") {
      if (this._activelyDraggingExistingLine) {
        this._activelyDraggingExistingLine.movePosition(timeColumnRow);
      }
      this.updateElements();
      this._activelyDraggingExistingLine = null;
    } else if (this._chartAction == "new") {
      if (this._activelyDraggingExistingLine) {
        this.updateElements();
        this._activelyDraggingExistingLine = null;
      } else if (this._activelyDraggingNewLineFixed) {
        if(this._activelyDraggingNewLine){
          let firstNewLine: DayStructureChartLabelLine = new DayStructureChartLabelLine(this._activelyDraggingNewLineFixed.startTime, this._activelyDraggingNewLineFixed.endTime, this._activelyDraggingNewLineFixed.bodyLabel, this._activelyDraggingNewLineFixed.startLabel, this._activelyDraggingNewLineFixed.style["background-color"]);
          let secondNewLine: DayStructureChartLabelLine = new DayStructureChartLabelLine(this._activelyDraggingNewLine.startTime, this._activelyDraggingNewLine.endTime, this._activelyDraggingNewLine.bodyLabel, this._activelyDraggingNewLine.startLabel, this._activelyDraggingNewLine.style.backgroundColor);
          this.removeActiveDraggingLines();
          this.chartLabelLines.push(firstNewLine);
          this.chartLabelLines.push(secondNewLine);
        }else{
          let newLine: DayStructureChartLabelLine = new DayStructureChartLabelLine(this._activelyDraggingNewLineFixed.startTime, this._activelyDraggingNewLineFixed.endTime, this._activelyDraggingNewLineFixed.bodyLabel, this._activelyDraggingNewLineFixed.startLabel, this._activelyDraggingNewLineFixed.style["background-color"]);
          newLine.setAsDraggable();
          this.removeActiveDraggingNewLineFixed();
          this.chartLabelLines.push(newLine);
        }
        this.updateElements();
      }
    }
  }
  private hovering(timeColumnRow: DayStructureTimeColumnRow) {
    if (this._chartAction == "new") {
      if (!this._activelyDraggingNewLineFixed && !this._activelyDraggingExistingLine) {
        this.removeActiveHoveringLine();
        if (!timeColumnRow.hasChartLabelLine) {
          this._activelyHoveringNewLine = new DayStructureChartLabelLine(timeColumnRow.startTime, timeColumnRow.startTime, "", "New time delineation", "");
          this._activelyHoveringNewLine.setAsTemporary();
          this.chartLabelLines.push(this._activelyHoveringNewLine);
        }
      }
    }
  }

  private removeActiveHoveringLine() {
    if (this._activelyHoveringNewLine != null) {
      if (this.chartLabelLines.indexOf(this._activelyHoveringNewLine) > -1) {
        this.chartLabelLines.splice(this.chartLabelLines.indexOf(this._activelyHoveringNewLine), 1);
      }
      this._activelyHoveringNewLine = null;
    }
  }
  private removeActiveDraggingLines() {
    this.removeActiveDraggingNewLine();
    this.removeActiveDraggingNewLineFixed();
  }

  private removeActiveDraggingNewLineFixed(){
    if (this._activelyDraggingNewLineFixed != null) {
      if (this.chartLabelLines.indexOf(this._activelyDraggingNewLineFixed) > -1) {
        this.chartLabelLines.splice(this.chartLabelLines.indexOf(this._activelyDraggingNewLineFixed), 1);
      }
      this._activelyDraggingNewLineFixed = null;
    }
  }
  private removeActiveDraggingNewLine(){
    if (this._activelyDraggingNewLine != null) {
      if (this.chartLabelLines.indexOf(this._activelyDraggingNewLine) > -1) {
        this.chartLabelLines.splice(this.chartLabelLines.indexOf(this._activelyDraggingNewLine), 1);
      }
      this._activelyDraggingNewLine = null;
    }
  }

  private determineChartLabelLine(timeColumnRow: DayStructureTimeColumnRow): DayStructureChartLabelLine {
    return this.chartLabelLines.find((chartLabelLine) => {
      return chartLabelLine.startTime.isSame(timeColumnRow.startTime);
    });
  }




  private updateElements() {
    this.updateChartLabelLines();
    this.updateTimeColumnRows();
  }

  private updateChartLabelLines() {
    this.chartLabelLines = this.chartLabelLines.sort((line1, line2) => {
      if (line1.startTime.isBefore(line2.startTime)) {
        return -1;
      }
      if (line1.startTime.isAfter(line2.startTime)) {
        return 1;
      }
      return 0;
    });
    for (let i = 0; i < this.chartLabelLines.length; i++) {
      if (i < this.chartLabelLines.length - 1) {
        if (!this.chartLabelLines[i].isTemporary) {
          let j: number = i;
          let foundEndTime: moment.Moment;
          while (j < this.chartLabelLines.length && foundEndTime == null) {
            if (!this.chartLabelLines[j + 1].isTemporary) {
              foundEndTime = this.chartLabelLines[j + 1].startTime;
            }
            j++;
          }
          this.chartLabelLines[i].endTime = moment(foundEndTime);
        }

      }
    }
  }

  private findNextEndTime(chartLabelLine: DayStructureChartLabelLine): moment.Moment{
    let tempLines = this.chartLabelLines.sort((line1, line2) => {
      if (line1.startTime.isBefore(line2.startTime)) {
        return -1;
      }
      if (line1.startTime.isAfter(line2.startTime)) {
        return 1;
      }
      return 0;
    }).filter((line)=>{
      return (!line.isSecondaryNew && !line.isTemporary);
    })
    let index: number = tempLines.indexOf(chartLabelLine);
    if(index > -1){
      

      if(index < tempLines.length-1){
        return tempLines[index+1].startTime;
      }else{
        console.log("error")
        return null;
      }

    }else{
      console.log("Error: bad chartLabelLine provided")
      return null;
    }
  
  } 
  
  private updateTimeColumnRows() {
    this.timeColumnRows.forEach((timeColumnRow) => {
      timeColumnRow.setDoesNotHaveChartLabelLine();
      this.chartLabelLines.forEach((chartLabelLine) => {
        if (timeColumnRow.startTime.isSame(chartLabelLine.startTime) && chartLabelLine.canDrag) {
          timeColumnRow.setHasChartLabelLine();
        }
      });
    });
  }



  ngOnDestroy() {

  }

}
