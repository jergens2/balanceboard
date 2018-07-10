import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'app';

  authenticated: boolean = false;

  constructor(private authService: AuthenticationService){}

  ngOnInit(){
    
    this.authService.authenticationStatus.subscribe(
      (change: boolean) => {
        this.authenticated = change;
        console.log("Authenticated? " , this.authenticated)
      }
    )
    this.authService.checkLocalStorage();
  }
}
