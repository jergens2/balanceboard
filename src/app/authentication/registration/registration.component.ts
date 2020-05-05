import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  constructor(private authService: AuthenticationService) { }

  
  registrationForm: FormGroup;
  confirmRegistrationForm: FormGroup;

  ngOnInit() {
    this.registrationForm = new FormGroup({
      'emailAddress': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, Validators.required)
    });
    this.confirmRegistrationForm = new FormGroup({
      'password': new FormControl(null, Validators.required),
    });
  }


  onClickContinueRegistration() {
    // if (this.registrationForm.valid) {
    //   this.setAction("waiting");
    //   this.authService.checkForExistingAccount$(this.registrationForm.controls['emailAddress'].value).subscribe((response: any) => {
    //     if (response.data == null) {
    //       this.setAction("confirm_registration");
    //     } else {
    //       this.setAction("register");
    //       this.formMessage = "An account with this email address already exists"
    //     }
    //   }, error => {
    //     this.setAction("error");
    //     this.errorMessage = error.message;
    //   })
    // } else {
    //   this.formMessage = "Form is invalid";
    // }

  }

  onClickCancelRegistration() {
    // this.setAction("welcome");
  }

  onClickFinishRegistration() {


    // if (this.registrationForm.controls['password'].value == this.confirmRegistrationForm.controls['password'].value) {
    //   this.setAction("waiting");
    //   // let defaultSettings: UserSetting[] = this.userSettingsService.createDefaultSettings();

    //   const username: string = this.registrationForm.controls['username'].value;
    //   const email: string = this.registrationForm.controls['email'].value;
    //   let newUser = new UserAccount(null, username, email);

    //   console.log("Registering new user:", newUser);
    //   this.authData = { userAccount: newUser.httpBody, password: this.registrationForm.controls['password'].value };
    //   console.log("Auth data is", this.authData);
      
    //   this.authService.registerNewUserAccount$(this.authData).subscribe((response: { data: any, message: string }) => {
    //     if (response != null) {
    //       this.setAction("successful_registration");
    //     } else {
    //       this.setAction("error");
    //       this.errorMessage = "No response from server.";2
    //     }
    //   }, error => {
    //     console.log(error);
    //     this.setAction("error");
    //     this.errorMessage = error.message;
    //   });

    // } else {
    //   this.setAction("confirm_registration");
    //   this.formMessage = "Passwords do not match";
    // }


  }
}
