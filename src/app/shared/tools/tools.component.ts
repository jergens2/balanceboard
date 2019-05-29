import { Component, OnInit } from '@angular/core';
import { ToolsService } from './tools.service';
import { ToolComponents } from './tool-components.enum';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { SizeService } from '../app-screen-size/size.service';
import { AppScreenSize } from '../app-screen-size/app-screen-size.enum';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {

  faTimes = faTimes;

  constructor(private toolsService: ToolsService, private sizeService: SizeService) { }

  ifNotepad: boolean = false;
  ifActionItem: boolean = false;
  ifTimelogEntry: boolean = false;
  // ifAppointment: boolean = 

  toolName: string = "";

  screenSize: AppScreenSize;
  
  ngOnInit() {

    this.sizeService.appScreenSize$.subscribe((size: AppScreenSize)=>{
      this.screenSize = size;
    })
    this.screenSize = this.sizeService.appScreenSize;

    this.toolsService.currentTool$.subscribe((tool: ToolComponents)=>{
      this.toolName = tool;
      // if(tool != null){
      //   if(tool == ToolComponents.Notepad){
      //     this.ifActionItem = false;
      //     this.ifTimelogEntry = false;
      //     this.ifNotepad = true;
      //   }
      //   if(tool == ToolComponents.ActionItem){
      //     this.ifNotepad = false;
      //     this.ifTimelogEntry = false;
      //     this.ifActionItem = true;
      //   }
      //   if(tool == ToolComponents.TimelogEntry){
      //     this.ifActionItem = false;
      //     this.ifNotepad = false;
      //     this.ifTimelogEntry = true;
      //   }
      // }
    });


    

  }

  onClickClose(){
    this.toolsService.closeTool(ToolComponents.Notepad);
  }

}
