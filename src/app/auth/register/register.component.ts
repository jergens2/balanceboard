import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registrationForm: FormGroup;

  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit() {
    this.registrationForm = new FormGroup({
      'email' : new FormControl(null, [Validators.email, Validators.required]),
      'password' : new FormControl(null, Validators.required)
    })
  }

  onClickRegister(){
    if (this.registrationForm.invalid){
      return;
    }
    console.log("form is valid");
    this.authenticationService.registerUser(this.registrationForm.value.email, this.registrationForm.value.password)
  }

}
