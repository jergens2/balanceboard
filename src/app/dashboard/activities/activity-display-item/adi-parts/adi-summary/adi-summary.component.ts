import { Component, OnInit } from '@angular/core';
import { ActivityDataAnalyzer } from '../../activity-data-analyzer.class';
import { ActivityComponentService } from '../../../activity-component.service';
import { ButtonMenu } from '../../../../../shared/components/button-menu/button-menu.class';

@Component({
  selector: 'app-adi-summary',
  templateUrl: './adi-summary.component.html',
  styleUrls: ['./adi-summary.component.css']
})
export class AdiSummaryComponent implements OnInit {
  
  constructor(private activitiesService: ActivityComponentService) { }

  private _rangeMenu: ButtonMenu = new ButtonMenu();

  public get analyzer(): ActivityDataAnalyzer { return this.activitiesService.analyzer; }
  public get occurrencesTotal(): string { return this.analyzer.occurrencesTotal; }
  public get durationHoursTotal(): string { return this.analyzer.durationHoursTotal; }
  public get medianHoursPerWeek(): string { return this.analyzer.medianHoursPerWeek; }
  public get medianOccurrencesPerWeek(): string { return this.analyzer.medianOccurrencesPerWeek; } 
  public get rangeMenu(): ButtonMenu { return this._rangeMenu; }

  ngOnInit(): void {
    this._rangeMenu.addItem$('7').subscribe(s => this._setRange('7'))
    this._rangeMenu.addItem$('30').subscribe(s => this._setRange('30'))
    this._rangeMenu.addItem$('90').subscribe(s => this._setRange('90'))
    this._rangeMenu.addItem$('365').subscribe(s => this._setRange('365'))
    this._rangeMenu.addItem$('Specify').subscribe(s => this._setRange('Specify'))
  }

  private _setRange(range: '7' | '30' | '90' | '365' | 'Specify'){
    if(range === '7'){
      this.analyzer.analyzeActivity
    }else if(range === '30'){

    }else if(range === '90'){

    }else if(range === '365'){

    }else if(range === 'Specify'){

    }

  }

}
