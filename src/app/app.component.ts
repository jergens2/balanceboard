import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthStatus } from './authentication/auth-status.model';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'app';

  faSpinner = faSpinner;

  authenticated: boolean = false;
  loading: boolean = true; 

  constructor(private authService: AuthenticationService){}

  ngOnInit(){
    
    this.authService.authStatus.subscribe(
      (authStatus: AuthStatus) => {
        console.log("authstatus", authStatus);
        if(authStatus.isAuthenticated){
          this.loading = false;
          this.authenticated = true;
        }else{
          this.authenticated = false;
        }
      }
    )
    this.authService.checkLocalStorage$.subscribe((isPresent: boolean)=>{
      console.log("is local storage presnet? ", isPresent);
      if(isPresent){

      }else{
        this.loading = false;
      }
    })
    this.authService.checkLocalStorage();

  }
}
