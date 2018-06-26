import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { AuthData } from '../models/auth-data.model';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {

  action: string = null;
  registrationForm: FormGroup;
  confirmRegistrationForm: FormGroup;
  authData: AuthData = {email: '', password: ''};
  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
    this.registrationForm = new FormGroup({
      'email' : new FormControl(null, [Validators.email, Validators.required]),
      'password' : new FormControl(null, [Validators.required, Validators.min(4)])
    });
    this.confirmRegistrationForm = new FormGroup({
      'password': new FormControl(null, [Validators.required, Validators.min(4)])
    })
    this.action = "initial"
  }

  onClickLogIn(){
    this.action = "authenticate";
  }

  onClickCancel(){
    this.action = "initial";
  }

  onClickRegister(){
    this.action = "register";
  }

  onContinueRegistration(){
    if(this.registrationForm.valid){
      this.authData.email = this.registrationForm.value.email
      this.authData.password =  this.registrationForm.value.password;
      this.action = "confirmRegistration";
    }
  }

  onSubmitRegistration(){
    if(this.confirmRegistrationForm.valid){
      if(this.confirmRegistrationForm.value.password === this.authData.password){
        this.authService.registerUser(this.authData);
      }else{
        //passwords do not match
      }
    }
  }

}
