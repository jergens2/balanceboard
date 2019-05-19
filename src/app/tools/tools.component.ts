import { Component, OnInit } from '@angular/core';
import { ToolsService } from './tools.service';
import { ToolComponents } from './tool-components.enum';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { SizeService } from '../shared/app-screen-size/size.service';
import { AppScreenSize } from '../shared/app-screen-size/app-screen-size.enum';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {

  faTimes = faTimes;

  constructor(private toolsService: ToolsService, private sizeService: SizeService) { }

  ifNotepad: boolean = false;
  ifToDo: boolean = false;

  screenSize: AppScreenSize;
  
  ngOnInit() {

    this.sizeService.appScreenSize$.subscribe((size: AppScreenSize)=>{
      this.screenSize = size;
    })
    this.screenSize = this.sizeService.appScreenSize;

    this.toolsService.currentTool$.subscribe((tool: ToolComponents)=>{
      if(tool != null){
        if(tool == ToolComponents.Notepad){
          this.ifToDo = false;
          this.ifNotepad = true;
        }
        if(tool == ToolComponents.Todo){
          this.ifNotepad = false;
          this.ifToDo = true;
        }
      }
    });


    

  }

  onClickClose(){
    this.toolsService.closeTool(ToolComponents.Notepad);
  }

}
