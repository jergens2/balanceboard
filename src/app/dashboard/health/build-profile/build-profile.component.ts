import { Component, OnInit } from '@angular/core';
import { FormGroup,FormControl } from '@angular/forms';

@Component({
  selector: 'app-build-profile',
  templateUrl: './build-profile.component.html',
  styleUrls: ['./build-profile.component.css']
})
export class BuildProfileComponent implements OnInit {

  constructor() { }

  healthProfileForm: FormGroup;

  ngOnInit() {
    this.healthProfileForm = new FormGroup({
      'weight' : new FormControl(null),
      'height' : new FormControl(null),
      'dob' : new FormControl(null),
    })
  }

}
