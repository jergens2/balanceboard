import { Component, OnInit } from '@angular/core';
import { JournalEntry } from './journal-entry/journal-entry.model';
import { JournalService } from './journal.service';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.css']
})
export class JournalComponent implements OnInit {

  constructor(private journalService: JournalService) { }


  journalEntries: JournalEntry[] = [];
  
  ngOnInit() {
    this.journalService.journalEntries$.subscribe((entries: JournalEntry[])=>{
      if(entries.length > 0){
        this.journalEntries = entries;
        console.log("journal entries are", this.journalEntries);
      }
      
    })
  }

}
