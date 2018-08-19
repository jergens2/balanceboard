import { Component, OnInit } from '@angular/core';
import { GenericDataEntry } from '../../generic-data/generic-data-entry.model';
import { FinanceService } from '../finance.service';
import { FinanceProfile } from '../finance-profile.model';

@Component({
  selector: 'app-net-worth',
  templateUrl: './net-worth.component.html',
  styleUrls: ['./net-worth.component.css']
})
export class NetWorthComponent implements OnInit {


  financeEntry: GenericDataEntry;
  financeProfile: FinanceProfile;

  constructor(private financeService: FinanceService) { }

  ngOnInit() {
    this.financeService.financeProfile.subscribe((financeEntry: GenericDataEntry)=>{
      if(financeEntry){
        this.financeEntry = financeEntry;
        this.financeProfile = this.financeEntry.dataObject as FinanceProfile;  
      }}
    )
  }

}
