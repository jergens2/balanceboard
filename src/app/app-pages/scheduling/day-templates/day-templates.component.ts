import { Component, OnInit } from '@angular/core';
import { DayTemplatesService } from './day-templates.service';
import { DayTemplate } from './day-template.class';

@Component({
  selector: 'app-day-templates',
  templateUrl: './day-templates.component.html',
  styleUrls: ['./day-templates.component.css']
})
export class DayTemplatesComponent implements OnInit {

  constructor(private dayTemplatesService: DayTemplatesService) { }


  dayTemplates: DayTemplate[] = [];

  ngOnInit() {

    this.dayTemplates = this.dayTemplatesService.dayTemplates;
    this.dayTemplatesService.dayTemplates$.subscribe((dayTemplates: DayTemplate[])=>{
      this.dayTemplates = dayTemplates;
    })

  }

}
