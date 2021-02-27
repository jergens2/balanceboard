import { Component, OnInit } from '@angular/core';
import { ToolboxService } from 'src/app/toolbox/toolbox.service';

@Component({
  selector: 'app-tablet-container',
  templateUrl: './tablet-container.component.html',
  styleUrls: ['./tablet-container.component.css']
})
export class TabletContainerComponent implements OnInit {

  constructor(private toolboxService: ToolboxService) { }
  
  public get showToolbox(): boolean { return this.toolboxService.toolIsOpen; }

  ngOnInit(): void {
  }

}
