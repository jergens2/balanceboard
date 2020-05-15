import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from '../../authentication.service';
import { FormGroup, FormControl } from '@angular/forms';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { timer } from 'rxjs';

@Component({
  selector: 'app-success-confirmation',
  templateUrl: './success-confirmation.component.html',
  styleUrls: ['./success-confirmation.component.css']
})
export class SuccessConfirmationComponent implements OnInit {
  public faArrowLeft = faArrowLeft;

  constructor(private authService: AuthenticationService) { }
  private _confirmingCode: boolean = false;
  private _confirmServerCodeForm: FormGroup;
  private _showResendButton: boolean = false;
  private _resending: boolean = false;

  public get showResendButton(): boolean { return this._showResendButton; }
  public get resending(): boolean { return this._resending; }

  public get emailAddress(): string { return this.authService.registrationController.email; }
  public get confirmingCode(): boolean { return this._confirmingCode; }
  public get confirmServerCodeForm(): FormGroup { return this._confirmServerCodeForm; }

  @Output() message: EventEmitter<string[]> = new EventEmitter();
  @Output() error: EventEmitter<string> = new EventEmitter();
  @Output() continue: EventEmitter<boolean> = new EventEmitter();
  @Output() cancel: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
    this._confirmServerCodeForm = new FormGroup({
      'registrationCode': new FormControl(null),
    });

  }

  public onClickConfirmCode() {
    this._confirmingCode = false;
    this.message.next([]);
    let codeVal: string = this.confirmServerCodeForm.controls['registrationCode'].value;
    
    if (codeVal) {
      this._confirmingCode = true;
      codeVal = codeVal.toUpperCase();
      const data: { email: string, code: string } = {
        email: this.authService.registrationController.email,
        code: codeVal,
      }

      this.authService.finalizeRegistration$(data).subscribe((response: {
        message: string,
        currentTime: string,
        codeMatch: boolean,
      }) => {
        if (response.codeMatch === true) {
          this.continue.emit(true);
        } else {
          this.message.emit(['Codes do not match'])
          this._showResendButton = true;
          this._confirmingCode = false;
        }
      }, (err) => {
        console.log("Error!", err);
        this.error.emit(err);
      });
    } else {
      this.message.emit(['No code entered']);
    }


  }

  public onClickResendCode(){
    this._resending = true;
    this._showResendButton = false;
    this.authService.resendRegistrationCode$().subscribe((response)=>{
      this.message.next(['New code has been sent']);
      this._resending = false;
      this._showResendButton = false;
      this._confirmServerCodeForm.controls['registrationCode'].reset();
    }, (err)=>{
      if(err){
        this.message.next([err]);
      }
    })
    timer(10000).subscribe((tick)=>{
      if(this._resending === true){
        this._resending = false;
        this._showResendButton = false;
      }

    });
  }

  public onCancel(){
    this.cancel.emit(true);
  }

}
