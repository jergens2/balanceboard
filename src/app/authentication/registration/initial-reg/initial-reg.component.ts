import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RegistrationData } from '../../auth-data.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from '../../authentication.service';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUser, faKey, faArrowLeft, faAt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-initial-reg',
  templateUrl: './initial-reg.component.html',
  styleUrls: ['./initial-reg.component.css']
})
export class InitialRegComponent implements OnInit {

  public faUser: IconDefinition = faUser;
  public faKey: IconDefinition = faKey;
  public faAt = faAt;
  public faArrowLeft = faArrowLeft;


  constructor(private authService: AuthenticationService) { }

  private _registrationForm: FormGroup;
  private _emailIsInvalid: boolean = false;
  private _passwordIsInvalid: boolean = false;
  private _usernameIsInvalid: boolean = false;
  private _checkingForExisting: boolean = false;

  public get usernameIsInvalid(): boolean { return this._usernameIsInvalid; }
  public get passwordIsInvalid(): boolean { return this._passwordIsInvalid; }
  public get emailIsInvalid(): boolean { return this._emailIsInvalid; }
  public get registrationForm(): FormGroup { return this._registrationForm; }
  public get checkingForExisting(): boolean { return this._checkingForExisting; }

  @Output() public message: EventEmitter<string[]> = new EventEmitter();
  @Output() public cancel: EventEmitter<boolean> = new EventEmitter();
  @Output() public continue: EventEmitter<boolean> = new EventEmitter();
  @Output() public goToConfirm: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
    this._registrationForm = new FormGroup({
      'username': new FormControl(null),
      'email': new FormControl(null, [Validators.required]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(8)]),
    });
    this._registrationForm.controls['username'].statusChanges.subscribe(() => {
      this._usernameIsInvalid = false;
    });
    this._registrationForm.controls['password'].statusChanges.subscribe(() => {
      this._passwordIsInvalid = false;
    });

    this._registrationForm.controls['email'].statusChanges.subscribe(() => {
      this._emailIsInvalid = false;
    });
  }

  public onClickContinue() {
    const usernameValue: string = this._registrationForm.controls['username'].value;
    const passwordValue: string = (this._registrationForm.controls['password'].value);
    const emailValue: string = this._registrationForm.controls['email'].value;



    const password: string = passwordValue;
    const email: string = emailValue !== null ? emailValue.toLowerCase() : '';
    const emailExp: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    let emailIsValid: boolean = false;
    if (email !== '' && emailExp.test(email)) {
      emailIsValid = true;
    }

    const passwordIsValid: boolean = (password !== null && password.length >= 8);

    const usernameIsValid: boolean = (usernameValue === '' || usernameValue === null
      || (usernameValue.length >= 6 && usernameValue.length <= 24));
    let usernameToLower: string = '';
    let usernameStylized: string = '';
    if (usernameValue === '' || usernameValue === null) {
      usernameToLower = 'NO_REGISTERED_USERNAME_USE_EMAIL';
      usernameStylized = 'NO_REGISTERED_USERNAME_USE_EMAIL';
    } else {
      usernameToLower = usernameValue.toLowerCase();
      usernameStylized = usernameValue;
    }

    if (emailIsValid && passwordIsValid && usernameIsValid) {

      this._emailIsInvalid = false;
      this._usernameIsInvalid = false;
      this._passwordIsInvalid = false;

      const authData: RegistrationData = {
        email: email,
        username: usernameToLower,
        usernameStylized: usernameStylized,
        password: passwordValue,
        pin: '',
      };

      this._checkForExisting(authData);
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
        message.push("Username must be 6 to 24 characters in length")
      }
      this.message.emit(message);
    }


  }
  private _checkForExisting(authData: RegistrationData) {
    this._checkingForExisting = true;
    this.authService.checkForExistingAccount$(authData.email, authData.username).subscribe((response: {
      message: string,
      usernameIsUnique: boolean,
      emailIsUnique: boolean,
      alreadyRegistered: boolean,
      codeIsPresent: boolean,
      registeredAt: string,
    }) => {
      // console.log("Response, ", response)
      if (response.usernameIsUnique === true && response.emailIsUnique === true) {
        this.authService.setInitialRegistrationData(authData);
        this.continue.emit(true);
      } else {
        let message: string[] = [];
        // console.log("respnose: " , response)
        if (response.alreadyRegistered === true) {
          if (response.usernameIsUnique === false) {
            message.push("Username already taken");
            this._usernameIsInvalid = true;
          }
          if (response.emailIsUnique === false) {
            message.push("Email already registered");
            this._emailIsInvalid = true;
          }
        } else {
          if (response.codeIsPresent === true) {
            this.authService.setInitialRegistrationData(authData);
            this.goToConfirm.emit(true);
          } else {
            if (response.usernameIsUnique === false) {
              message.push("Username already taken");
              this._usernameIsInvalid = true;
            }
            if (response.emailIsUnique === false) {
              message.push("Email already registered");
              this._emailIsInvalid = true;
            }
          }
        }


        this.message.emit(message);
      }
      this._checkingForExisting = false;
    }, (error) => {
      console.log("Error", error);
      this.message.emit(["Error: there seems to be an issue with the server"]);
      this._checkingForExisting = false;
    });
  }

  public onClickCancel() {
    this.cancel.emit(true);
  }
}
