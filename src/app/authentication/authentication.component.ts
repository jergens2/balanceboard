import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from './authentication.service';
import { AuthData } from './auth-data.model';
import { AuthStatus } from './auth-status.model';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {

  action: string = null;
  actionMessage: string = null;
  errorMessage: string = '';
  registrationForm: FormGroup;
  confirmRegistrationForm: FormGroup;
  authenticationForm: FormGroup;
  authData: AuthData = {email: '', password: ''};
  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
    this.authenticationForm = new FormGroup({
      'email' : new FormControl(null, [Validators.email, Validators.required]),
      'password' : new FormControl(null, [Validators.required ])
    })
    this.registrationForm = new FormGroup({
      'email' : new FormControl(null, [Validators.email, Validators.required]),
      'password' : new FormControl(null, [Validators.required ])
    });
    this.confirmRegistrationForm = new FormGroup({
      'password': new FormControl(null, [Validators.required ])
    })
    this.setAction("initial");
  }

  authenticate(authData: AuthData){
    this.setAction("waiting");
    this.authService.authStatus.subscribe((authStatus: AuthStatus)=>{
      if(authStatus.isAuthenticated == false){
        this.errorMessage = "Error: bad username or password.";
        this.setAction("authenticate");
      }
    })
    let authResponse = this.authService.authenticateUser(authData);  
  }

  onClickLogIn(){
    this.setAction("authenticate");
  }

  onClickCancel(){
    this.setAction("initial");
  }

  onClickRegister(){
    this.setAction("register");
  }

  onContinueAuthentication(){
    if(this.action == "authenticate"){
      if(this.authenticationForm.valid){
        this.authData.email = this.authenticationForm.value.email;
        this.authData.password = this.authenticationForm.value.password;
        this.authenticate(this.authData);
      }else{
        //form is invalid
      }
    }else if(this.action == "final"){
      this.authenticate(this.authData);
    }
  }

  onContinueRegistration(){
    if(this.registrationForm.valid){
      this.setAction("waiting");
      this.authData.email = this.registrationForm.value.email;
      this.authData.password =  this.registrationForm.value.password;
      this.authService.checkForExistingAccount(this.authData.email)
        .subscribe((response: {message: string, data: any}) => {
          if(response.data == this.authData.email){
            this.setAction("register");
            this.errorMessage = "There is already an account with this email address";
          }else{
            this.setAction("confirmRegistration");
          }
        })
    }else{
      //console.log("form is invald onContinueRegistration()");
    }
  }

  onSubmitRegistration(){
    if(this.confirmRegistrationForm.valid){
      if(this.confirmRegistrationForm.value.password === this.authData.password){
        this.setAction("waiting");
        this.authService.registerUser(this.authData)
          .subscribe(
            (response) =>{
              this.actionMessage = "Woohoo! " + this.authData.email + " has been successfully registered!";
              this.setAction("final");
            }
          );
      }else{
        this.errorMessage = "Error: Passwords do not match";
      }
    }else{
      //form is invalid
    }
  }


  setAction(action: string){
    this.errorMessage = null;
    this.action = action;
  }

}
