import * as moment from 'moment';
import { Component, OnInit, OnDestroy } from '@angular/core';


import { AuthenticationService } from '../../authentication/authentication.service';
import { faHome } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthenticationService) { }

  faHome = faHome;

  ngOnInit() {
    
  }

  ngOnDestroy(){
  }



}
