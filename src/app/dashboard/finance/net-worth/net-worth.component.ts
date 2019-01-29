import { Component, OnInit } from '@angular/core';
// import { GenericDataEntry } from '../../generic-data/generic-data-entry.model';
import { FinanceService } from '../finance.service';
import { FinanceProfile } from '../finance-profile.model';
import { NetWorthProfile } from './net-worth-profile.model';
import { NetWorthItem } from './net-worth-item.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import * as moment from 'moment';

@Component({
  selector: 'app-net-worth',
  templateUrl: './net-worth.component.html',
  styleUrls: ['./net-worth.component.css']
})
export class NetWorthComponent implements OnInit {


  // financeEntry: GenericDataEntry;
  financeProfile: FinanceProfile;
  netWorthProfile: NetWorthProfile;
  assets: NetWorthItem[];
  liabilities: NetWorthItem[];
  calculatedNetWorth: number;

  addAsset: boolean = false;

  addAssetForm: FormGroup;

  constructor(private financeService: FinanceService) { }

  ngOnInit() {
    // this.financeService.financeProfile.subscribe((financeEntry: GenericDataEntry)=>{
    //   console.log("networthcomponent: financeProfile", financeEntry);
    //   if(financeEntry){
    //     this.financeEntry = financeEntry;
    //     this.financeProfile = this.financeEntry.dataObject as FinanceProfile;  
    //     if(this.financeProfile.netWorthProfile){
    //       this.calculatedNetWorth = 0;
    //       this.netWorthProfile = this.financeProfile.netWorthProfile;
    //       this.assets = this.netWorthProfile.assets;
    //       this.liabilities = this.netWorthProfile.liabilities;
    //       for(let asset of this.assets){
    //         this.calculatedNetWorth += asset.value;
    //       }
    //     }
    //   }}
    // )
    // this.addAssetForm = new FormGroup({
    //   'title' : new FormControl(null, Validators.required),
    //   'description': new FormControl(null),
    //   'value': new FormControl(0, [Validators.min(0), Validators.required]),
    //   'quantity': new FormControl(1, [Validators.min(0)]),
    //   'type': new FormControl(null),
    // });
  }

  onClickSaveAsset(){
    if(this.addAssetForm.valid){
      let newAsset = new NetWorthItem(moment().toISOString());
      newAsset.title = this.addAssetForm.get('title').value;
      newAsset.description = this.addAssetForm.get('description').value;
      newAsset.value = this.addAssetForm.get('value').value;
      newAsset.quantity = this.addAssetForm.get('quantity').value;
      newAsset.type = this.addAssetForm.get('type').value;
      
      if(!this.netWorthProfile){
        let newNetWorthProfile: NetWorthProfile = new NetWorthProfile(moment().toISOString());
        newNetWorthProfile.assets = [];
        newNetWorthProfile.assets.push(newAsset);
        this.saveProfile(newNetWorthProfile);
      }else{
        let netWorthProfile = this.netWorthProfile;
        netWorthProfile.dateUpdatedISO = moment().toISOString();
        netWorthProfile.assets.push(newAsset);
        this.saveProfile(netWorthProfile);
      }
      this.addAsset = !this.addAsset;
    }
  }





  private saveProfile(netWorthProfile: NetWorthProfile){
    // if(!this.financeProfile){
    //   let newFinanceProfile: FinanceProfile = new FinanceProfile(moment().toISOString());
    //   newFinanceProfile.netWorthProfile = netWorthProfile;
    //   this.financeService.saveFinanceProfile(newFinanceProfile);
    // }else{
    //   this.financeProfile.dateUpdatedISO = moment().toISOString();
    //   this.financeProfile.netWorthProfile = netWorthProfile;
    //   this.financeService.updateFinanceProfile(this.financeProfile);
    // }
  }

  onClickAddAsset(){
    this.addAsset = !this.addAsset;
  }

}
