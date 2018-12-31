import { Component, OnInit, OnDestroy } from '@angular/core';
import { faCogs, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../authentication/authentication.service';
import { NavItem } from '../nav-item.model';
import { navigationItems } from '../nav-items';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthenticationService, private router: Router) { }
  faCogs = faCogs;
  faSignOutAlt = faSignOutAlt;

  menuIsExpanded: boolean;
  menuSubscription: Subscription;

  navItems: NavItem[] = [];

  ngOnInit() {
    this.navItems = navigationItems;
    this.menuIsExpanded = false;
    this.menuSubscription = new Subscription();
  }

  onClickMenuButton(){
    this.menuIsExpanded = !this.menuIsExpanded;
    this.menuSubscription.unsubscribe();
  }

  onMouseEnterMenu(){
    this.menuSubscription.unsubscribe();
  }
  
  onMouseLeaveMenu(){
    this.menuSubscription.unsubscribe();
    let documentClickListener: Observable<Event> = fromEvent(document, 'click');
    this.menuSubscription = documentClickListener.subscribe((click)=>{  
      this.menuIsExpanded = false;
    })

  }

  onClickMenuItem(){
    this.menuSubscription.unsubscribe();
    this.menuIsExpanded = false;
  }

  onClickLogout(){
    this.authService.logout();
  }


  ngOnDestroy(){
    this.menuSubscription.unsubscribe();
  }

}
