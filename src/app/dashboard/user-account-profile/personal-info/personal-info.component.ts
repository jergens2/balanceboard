import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { faCheck, faEdit } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit {

  constructor() { }

  public faCheck = faCheck;
  public faEdit = faEdit; 

  private _givenName: string = '';
  private _familyName: string = '';
  private _dateOfBirth: string = '';

  private _isEditingGivenName: boolean = true;
  private _isEditingFamilyName: boolean = true;
  private _isEditingDOB: boolean = true;

  private _userInformationForm: FormGroup;

  public get familyName(): string { return this._familyName; }
  public get givenName(): string { return this._givenName; }
  public get dateOfBirth(): string { return this._dateOfBirth; }

  public get userInformationForm(): FormGroup { return this._userInformationForm; }

  public get isEditingGivenName(): boolean { return this._isEditingGivenName; }
  public get isEditingFamilyName(): boolean { return this._isEditingFamilyName; }
  public get isEditingDOB(): boolean { return this._isEditingDOB; }
  

  ngOnInit(): void {
    this._userInformationForm = new FormGroup({
      'givenName': new FormControl(''),
      'familyName': new FormControl(''),
      'dateOfBirth': new FormControl(''),
    });

  }

}
