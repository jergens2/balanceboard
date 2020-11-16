import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from '../../authentication.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { faKey, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-confirm-password',
  templateUrl: './confirm-password.component.html',
  styleUrls: ['./confirm-password.component.css']
})
export class ConfirmPasswordComponent implements OnInit {

  public faKey = faKey;
  public faArrowLeft = faArrowLeft;

  constructor(private authService: AuthenticationService) { }

  private _confirmPasswordForm: FormGroup;
  public get usernameIsPresent(): boolean { return this.authService.registrationController.usernameIsPresent }
  public get confirmPasswordForm(): FormGroup { return this._confirmPasswordForm; }
  public get email(): string { return this.authService.registrationController.email; }
  public get username(): string { return this.authService.registrationController.usernameStylized; }

  @Output() public result: EventEmitter<boolean> = new EventEmitter();
  @Output() public back: EventEmitter<boolean> = new EventEmitter();
  @Output() public message: EventEmitter<string[]> = new EventEmitter(); 

  ngOnInit() {
    this._confirmPasswordForm = new FormGroup({
      'password': new FormControl(null, Validators.required),
    });
  }

  public onClickConfirmPassword() {

    const password1 = this.authService.registrationController.password;
    const password2 = this._confirmPasswordForm.controls['password'].value;
    if (password2.length >= 8 && password1 === password2) {
      this.result.emit(true);
    } else {
      this.message.emit(['Passwords do not match']);
    }
  }

  public onGoBack(){
    this.back.emit(true);
  }

}
