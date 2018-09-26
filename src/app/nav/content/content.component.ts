import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../authentication/authentication.service';
import { HomeService } from '../../dashboard/home/home.service';
import { GenericDataEntryService } from '../../dashboard/generic-data/generic-data-entry.service';
import { AuthStatus } from '../../authentication/auth-status.model';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthenticationService, private homeService: HomeService, private dataService: GenericDataEntryService) { 
  }

  ngOnInit() {
    this.authService.authStatus.subscribe((authStatus: AuthStatus)=>{
      if(authStatus.isAuthenticated){
        
      }else{
        this.ngOnDestroy();
      }      
    })
  }

  ngOnDestroy(){
    console.log("ngOnDestroy() called");
  }

}
