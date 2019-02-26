import { Component, OnInit, Input } from '@angular/core';
import { IHeaderMenu } from './header-menu.interface';
import { NavItem } from '../../nav-item.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.css']
})
export class HeaderMenuComponent implements OnInit {

  constructor(private router: Router) { }

  @Input() openMenu: IHeaderMenu;

  ngOnInit() {
    
  }

  onClickHeaderMenuItem(menuItem: NavItem){
    if(menuItem.routerLink != null && menuItem.routerLink != ''){
      this.router.navigate([menuItem.routerLink]);
    }else{
      /*
        onClick() will emit an event, which is subscribed to by the component,
        and the actual logic is executed by whichever component subscribes to the onClick()
        For example, in HeaderComponent, signout menu item subscription will execute signout 
      */
      menuItem.onClick();
    }
    
  }

}
