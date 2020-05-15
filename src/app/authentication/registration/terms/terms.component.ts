import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { faCircle, faCrow, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSquare, faCheckSquare } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent implements OnInit {

  constructor() { }
  public faCircle = faCircle;
  public faCrow = faCrow;
  public faSquare = faSquare;
  public faCheckSquare = faCheckSquare;
  public faArrowLeft = faArrowLeft;

  private _termsAreAccepted: boolean = false;
  public get termsAreAccepted(): boolean { return this._termsAreAccepted; }

  @Output() public terms: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
  }

  public onClickTermsAccepted(agreement: boolean) {
    if (agreement === true) {
      this._termsAreAccepted = true;
    } else if (agreement === false) {
      this._termsAreAccepted = false;
    }
  }

  public onClickContinue(){
    if(this._termsAreAccepted === true){
      this.terms.emit(true);
    }
  }

  public onClickBack(){
    this.terms.emit(false);
  }

}
