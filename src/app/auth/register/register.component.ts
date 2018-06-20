import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registrationForm: FormGroup;

  constructor() { }

  ngOnInit() {
    this.registrationForm = new FormGroup({
      'email' : new FormControl(null),
      'password' : new FormControl(null)
    })
  }

  onClickRegister(){
    
  }

}
