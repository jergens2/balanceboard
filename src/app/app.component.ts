import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthStatus } from './authentication/auth-status.model';

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
    
    this.authService.authStatus.subscribe(
      (authStatus: AuthStatus) => {
        this.authenticated = authStatus.isAuthenticated;
      }
    )
    if(this.authService.checkLocalStorage()){
      //localStorage has token and userId value, so the view will automatically load 
    }else{
      //localStorage does not have token or User ID, so the view will automatically go to auth.
    };
  }
}
