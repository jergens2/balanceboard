import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { SleepManagerService } from '../../sleep-manager.service';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sm-dreams',
  templateUrl: './sm-dreams.component.html',
  styleUrls: ['./sm-dreams.component.css']
})
export class SmDreamsComponent implements OnInit {

  public faPlus = faPlus;
  public faEdit = faEdit;
  public faTrash = faTrash;

  constructor(private sleepService: SleepManagerService) { }

  public dreamsForm: FormGroup;

  private _existingDreams: string[] = [];
  private _displayDreams: string[] = [];
  private _showAddButton: boolean = false;
  public get existingDreams(): string[] { return this._existingDreams; }
  public get displayDreams(): string[] { return this._displayDreams; }
  public get showAddButton(): boolean { return this._showAddButton; }

  private _editingDream: string = "";

  ngOnInit(): void {


    if (this.sleepService.sleepManagerForm.dreamsSet) {
      if (this.sleepService.sleepManagerForm.formInputDreams.length > 0) {
        this._existingDreams = this.sleepService.sleepManagerForm.formInputDreams.filter(item => true);
        this._displayDreams = this.sleepService.sleepManagerForm.formInputDreams.filter(item => true);
      }
    } else {

    }
    let controlValue: string = "";
    this.dreamsForm = new FormGroup({
      'dreams': new FormControl(),
    });
    this._resub();
  }

  private _valueChangeSub: Subscription = new Subscription();
  private _resub() {
    this._valueChangeSub.unsubscribe();
    this._valueChangeSub = this.dreamsForm.controls['dreams'].valueChanges.subscribe((valueChange) => {
      if (valueChange !== null) {
        console.log("Value changed: ", valueChange);

        if (valueChange.length > 0) {
          this._showAddButton = true;
        } else {
          this._showAddButton = false;
        }

        const existingEditing = this.existingDreams.indexOf(this._editingDream);
        if (existingEditing > -1) {
          // console.log("existing one is guuci")
          this._existingDreams.splice(existingEditing, 1, valueChange);
          this._editingDream = valueChange;
        } else {
          this._existingDreams.push(this._editingDream);
        }

        this.sleepService.sleepManagerForm.setformInputDreams(this._existingDreams.filter(item => true));
        this._displayDreams = this._existingDreams.filter(item => item !== this._editingDream);


        // console.log("All dreams : ", this.existingDreams);
      }

    });

  }

  public onClickAddDream() {
    const saveDream = this.dreamsForm.controls['dreams'].value;
    const existingEditing = this.existingDreams.indexOf(this._editingDream);
    if (existingEditing > -1) {
      this._existingDreams.splice(existingEditing, 1, saveDream);
      this._editingDream = "";
      this._displayDreams = this._existingDreams.filter(item => true);
      this.sleepService.sleepManagerForm.setformInputDreams(this._existingDreams.filter(item => true));
    } else {
      console.log("Por que?")
    }
    this.dreamsForm.reset();
    this._resub();
    this._showAddButton = false;
  }

  public onClickDelete(dream) {
    const foundDream = this._existingDreams.indexOf(dream);
    if (foundDream > -1) {
      this._existingDreams.splice(foundDream, 1);
      const displayIndex = this._displayDreams.indexOf(dream);
      if(displayIndex > -1){
        this._displayDreams.splice(displayIndex, 1);
      }
    } else {
      console.log("Error deleting");
    }
  }

  public onClickEdit(editDream) {
    const foundDream = this._existingDreams.indexOf(editDream);
    if (foundDream > -1) {
      this._existingDreams.splice(foundDream, 1);
      const saveDream = this.dreamsForm.controls['dreams'].value;
      if (saveDream) {
        this._existingDreams.push(saveDream);
      }

      this.dreamsForm.reset();
      this.dreamsForm.controls['dreams'].setValue(editDream);
      this._resub();
      this._showAddButton = false;


    } else {
      console.log("Error deleting");
    }
  }



}
