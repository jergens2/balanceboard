import { Component, OnInit } from '@angular/core';
import { NotebookEntry } from './notebook-entry/notebook-entry.model';
import { NotebooksService } from './notebooks.service';

@Component({
  selector: 'app-notebooks',
  templateUrl: './notebooks.component.html',
  styleUrls: ['./notebooks.component.css']
})
export class NotebooksComponent implements OnInit {

  constructor(private notebooksService: NotebooksService) { }


  notebookEntries: NotebookEntry[] = [];
  
  ngOnInit() {
    this.notebooksService.notebookEntries$.subscribe((entries: NotebookEntry[])=>{
      if(entries.length > 0){
        this.notebookEntries = entries;
        console.log("notebookEntries entries are", this.notebookEntries);
      }
      
    })
  }

}
