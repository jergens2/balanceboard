import { Component, OnInit } from '@angular/core';
import { ToolsService } from './tools.service';
import { ToolComponents } from './tool-components.enum';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {

  constructor(private toolsService: ToolsService) { }

  ifNotepad: boolean = false;
  ifToDo: boolean = false;
  ngOnInit() {

    this.toolsService.currentTool$.subscribe((tool: ToolComponents)=>{
      if(tool != null){
        if(tool == ToolComponents.Notepad){
          this.ifNotepad = true;
        }
        if(tool == ToolComponents.Todo){
          this.ifToDo = true;
        }
      }
    })

  }

}
