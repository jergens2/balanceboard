import { Component, OnInit } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToolsService } from '../../tools.service';
import { ToolComponents } from '../../tool-components.enum';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {

  faTimes = faTimes;

  constructor(private toolsService: ToolsService) { }

  ngOnInit() {
  }

  onClickClose(){ 
    this.toolsService.closeTool(ToolComponents.Todo)
  }

}
