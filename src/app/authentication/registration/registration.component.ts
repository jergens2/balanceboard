import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUser, faKey, faArrowLeft, faAt, } from '@fortawesome/free-solid-svg-icons';
import { AuthData } from '../auth-data.interface';
import * as moment from 'moment';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  constructor(private authService: AuthenticationService) { }

  public faUser: IconDefinition = faUser;
  public faKey: IconDefinition = faKey;
  public faArrowLeft = faArrowLeft;
  public faAt = faAt;

  private _registrationForm: FormGroup;
  private _confirmPasswordForm: FormGroup;
  private _confirmServerCodeForm: FormGroup;
  private _createdPin: string = '';
  private _formMessage: string[] = [];
  private _errorMessage: string = "";
  private _action: 'CONFIRM_PASSWORD' | 'CREATE_PIN' | 'SUCCESSFUL_REG_START' | 'INITIAL' | 'WAITING' | 'FAIL' = 'INITIAL';


  private _emailIsInvalid: boolean = false;
  private _passwordIsInvalid: boolean = false;
  private _usernameIsInvalid: boolean = false;
  private _checkingForExisting: boolean = false;
  private _authData: AuthData;
  private _confirmingCode: boolean = false;

  public get registrationForm(): FormGroup { return this._registrationForm; }
  public get confirmPasswordForm(): FormGroup { return this._confirmPasswordForm; }
  public get confirmServerCodeForm(): FormGroup { return this._confirmServerCodeForm; }
  public get formMessage(): string[] { return this._formMessage; }
  public get action(): 'CONFIRM_PASSWORD' | 'CREATE_PIN' | 'SUCCESSFUL_REG_START' | 'INITIAL' | 'WAITING' | 'FAIL' { return this._action; }
  public get errorMessage(): string { return this._errorMessage; }

  public get usernameIsInvalid(): boolean { return this._usernameIsInvalid; }
  public get passwordIsInvalid(): boolean { return this._passwordIsInvalid; }
  public get emailIsInvalid(): boolean { return this._emailIsInvalid; }
  public get checkingForExisting(): boolean { return this._checkingForExisting; }
  public get confirmingCode(): boolean { return this._confirmingCode; }

  public get usernameIsPresent(): boolean { return this.registrationForm.controls['username'].value }
  public get emailAddress(): string { return this.registrationForm.controls['email'].value }

  @Output() public cancel: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
    this._registrationForm = new FormGroup({
      'username': new FormControl(null),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(8)]),
    });
    this._confirmPasswordForm = new FormGroup({
      'password': new FormControl(null, Validators.required),
    });
    this._confirmServerCodeForm = new FormGroup({
      'registrationCode': new FormControl(null),
    });

    this._registrationForm.controls['email'].statusChanges.subscribe(() => {
      this._emailIsInvalid = false;
    });
    this._registrationForm.controls['username'].statusChanges.subscribe(() => {
      this._usernameIsInvalid = false;
    });
    this._registrationForm.controls['password'].statusChanges.subscribe(() => {
      this._passwordIsInvalid = false;
    });
  }


  public onClickContinue() {
    const usernameValue: string = '' + this._registrationForm.controls['username'].value;
    let usernameToLower: string = (usernameValue + '').toLowerCase();
    const password: string = (this._registrationForm.controls['password'].value);
    const email: string = (this._registrationForm.controls['email'].value + '').toLowerCase();;

    const emailIsValid: boolean = this._registrationForm.controls['email'].valid;
    const passwordIsValid: boolean = password.length >= 8;

    const usernameIsValid: boolean = usernameValue.length <= 24;

    this._formMessage = [];
    this._errorMessage = '';
    if (emailIsValid && passwordIsValid && usernameIsValid) {

      this._emailIsInvalid = false;
      this._usernameIsInvalid = false;
      this._passwordIsInvalid = false;
      this._checkForExisting(email, usernameToLower);
    } else {
      let message: string[] = []
      if (!emailIsValid) {
        message.push("Email is invalid")
        this._emailIsInvalid = true;
      }
      if (!passwordIsValid) {
        this._passwordIsInvalid = true;
        message.push("Password must be at least 8 characters in length");
      }
      if (!usernameIsValid) {
        this._usernameIsInvalid = true;
        message.push("Username must be 0 to 24 characters in length")
      }
      this._formMessage = message;
    }


  }
  public onClickBack() { this._setAction('INITIAL'); }
  public onClickStartRegistration() { this._setAction('INITIAL'); }
  public onClickGoToConfirmPassword() { this._setAction('CONFIRM_PASSWORD'); }

  private _setAction(action: 'CONFIRM_PASSWORD' | 'CREATE_PIN' | 'SUCCESSFUL_REG_START' | 'INITIAL' | 'WAITING' | 'FAIL') {
    this._action = action;
    this._formMessage = [];
    this._errorMessage = '';
    this._checkingForExisting = false;
    this._confirmingCode = false;
  }

  public onClickConfirmPassword() {
    this._formMessage = [];
    this._errorMessage = '';
    const password1 = this._registrationForm.controls['password'].value;
    const password2 = this._confirmPasswordForm.controls['password'].value;
    if (password1 === password2 && password1.length >= 8) {
      this._setAction('CREATE_PIN');
    } else {
      this._formMessage = ['Passwords do not match'];
    }
  }

  public onClickConfirmCode() {
    this._confirmingCode = false;
    this._formMessage = [];
    let code: string = this.confirmServerCodeForm.controls['registrationCode'].value;

    if (code) {
      this._setAction('WAITING');
      this._confirmingCode = true;
      const email: string = ('' + this.registrationForm.controls['email'].value).toLowerCase();
      code = code.toUpperCase();
      const data: { email: string, code: string } = {
        email: email,
        code: code,
      }
      
      this.authService.finalizeRegistration$(data).subscribe((response) => {
        console.log("Response: zxzxdzdc", response)
        if (response.data) {

          const registrationTime = moment(response.data);
          /**
           * 
           * 
           * START HERE.
           * This works.  Everything up to this point works.  Need to fix this attemptLogin method and on the server as well
           * 
           * 
           */
          this.authService.attemptLogin(this._authData);
        } else {
          console.log("Error with response.data");
          this._setAction('FAIL');
        }

      }, (err) => {
        console.log("Error!", err);
        this._errorMessage = err.message;
        this._setAction('FAIL');
      });
      
    } else {
      this._formMessage = ['No code entered'];
    }


  }

  public onPinCreated(pin: string) {
    this._createdPin = '';
    if (pin.length >= 4 && pin.length <= 8) {
      this._setAction('WAITING');
      this._createdPin = pin;
      this._finalizeRegistration();
    } else {
      this._setAction('FAIL');
      console.log("Error with pin: ", pin);
    }
  }

  private _finalizeRegistration() {
    const email: string = ('' + this.registrationForm.controls['email'].value).toLowerCase();

    let usernameStylized: string = this.registrationForm.controls['username'].value;
    let username: string = '';
    if (!usernameStylized) {
      usernameStylized = 'NO_REGISTERED_USERNAME_USE_EMAIL';
      username = usernameStylized;
    } else {
      username = usernameStylized.toLowerCase();
    }
    console.log("username, usernameStylized: ", username, usernameStylized)
    const password = this.registrationForm.controls['password'].value;
    const pin = this._createdPin;
    this._createdPin = '';
    const authData: AuthData = {
      email: email,
      username: username,
      usernameStylized: usernameStylized,

      password: password,
      pin: pin,
    }
    this._authData = authData;
    this.authService.registerNewUserAccount$(authData).subscribe((response) => {
      this._setAction('SUCCESSFUL_REG_START')
    }, (err) => {
      console.log("Error registering: ", err);
      this._errorMessage = err.message;
      this._setAction('FAIL');
    });
  }


  private _checkForExisting(email: string, username: string) {
    this._checkingForExisting = true;
    if (!username) {
      username = 'NO_USERNAME_PROVIDED_BY_USER';
    }
    this.authService.checkForExistingAccount$(email, username).subscribe((response: {
      message: string,
      usernameIsUnique: boolean,
      emailIsUnique: boolean,
    }) => {
      if (response.usernameIsUnique === true && response.emailIsUnique === true) {
        this._setAction('CONFIRM_PASSWORD');
      } else {
        let message: string[] = [];
        if (response.usernameIsUnique === false) {
          message.push("Username already taken");
          this._usernameIsInvalid = true;
        }
        if (response.emailIsUnique === false) {
          message.push("Email already registered");
          this._emailIsInvalid = true;
        }
        this._formMessage = message;
      }
      this._checkingForExisting = false;
    }, (error) => {
      console.log("Error", error);
      this._errorMessage = "Error: there seems to be an issue with the server";
      this._checkingForExisting = false;
    });
  }


  onClickCancel() {
    this.cancel.emit(true);
  }



}
