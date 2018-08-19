import { Component, OnInit } from '@angular/core';
import { GenericDataEntry } from '../../generic-data/generic-data-entry.model';
import { FinanceService } from '../finance.service';
import { FinanceProfile } from '../finance-profile.model';
import { NetWorthProfile } from './net-worth-profile.model';
import { NetWorthAsset } from './net-worth-asset.model';
import { NetWorthLiability } from './net-worth-liability.model';
import { FormGroup, FormControl } from '@angular/forms';

import * as moment from 'moment';

@Component({
  selector: 'app-net-worth',
  templateUrl: './net-worth.component.html',
  styleUrls: ['./net-worth.component.css']
})
export class NetWorthComponent implements OnInit {


  financeEntry: GenericDataEntry;
  financeProfile: FinanceProfile;
  netWorthProfile: NetWorthProfile;
  assets: NetWorthAsset[];
  liabilities: NetWorthLiability[];

  addAsset: boolean = false;
  addLiability: boolean = false;

  addAssetForm: FormGroup;
  addLiabilityForm: FormGroup;

  constructor(private financeService: FinanceService) { }

  ngOnInit() {
    this.financeService.financeProfile.subscribe((financeEntry: GenericDataEntry)=>{
      if(financeEntry){
        this.financeEntry = financeEntry;
        this.financeProfile = this.financeEntry.dataObject as FinanceProfile;  
        if(this.financeProfile.netWorthProfile){
          this.netWorthProfile = this.financeProfile.netWorthProfile;
          this.assets = this.netWorthProfile.assets;
          this.liabilities = this.netWorthProfile.liabilities;
        }
      }}
    )
    this.addAssetForm = new FormGroup({
      'title' : new FormControl(null),
      'description': new FormControl(null),
      'value': new FormControl(null),
      'quantity': new FormControl(null),
      'type': new FormControl(null),
    });
    this.addLiabilityForm = new FormGroup({

    });
  }

  onClickSaveAsset(){
    let newAsset = new NetWorthAsset(moment().toISOString());
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
    

  }

  onClickSaveLiability(){
    
  }



  private saveProfile(netWorthProfile: NetWorthProfile){
    if(!this.financeProfile){
      let newFinanceProfile: FinanceProfile = new FinanceProfile(moment().toISOString());
      newFinanceProfile.netWorthProfile = netWorthProfile;
      this.financeService.saveFinanceProfile(newFinanceProfile);
    }else{
      this.financeProfile.dateUpdatedISO = moment().toISOString();
      this.financeProfile.netWorthProfile = netWorthProfile;
      this.financeService.updateFinanceProfile(this.financeProfile);
    }
  }

  onClickAddAsset(){
    this.addAsset = !this.addAsset;
  }

  onClickAddLiability(){
    this.addLiability = !this.addLiability;
  }

}
