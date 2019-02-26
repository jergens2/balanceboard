import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { IHeaderMenu } from './header-menu/header-menu.interface';
import { appMenuItems } from '../app-menu-items';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { faBars, faCogs } from '@fortawesome/free-solid-svg-icons';
import { NavItem } from '../nav-item.model';
import { HeaderService } from './header.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private headerService: HeaderService, private authService: AuthenticationService, private router: Router) { }

  faBars = faBars;
  faCogs = faCogs;

  activeAppTool: string = null;

  headerMenus: IHeaderMenu[] = [];

  @Output() sidebarButtonClicked: EventEmitter<boolean> = new EventEmitter();

  private get menuIsOpen(): boolean{
    let anyOpen = false;
    for(let headerMenu of this.headerMenus){
      if(headerMenu.isOpen){ 
        return headerMenu.isOpen;
      }
    }
    return anyOpen;
  }

  ngOnInit() {
    
    this.headerMenus = this.buildHeaderMenus();
    this.headerService.activeBalanceBoardComponentMenu$.subscribe((componentMenu: IHeaderMenu)=>{
      if(componentMenu != null){
        this.headerMenus = this.buildHeaderMenus(componentMenu);
      }else{
        this.headerMenus = this.buildHeaderMenus();
      }
    })

    this.router.events.subscribe((event)=>{
      /*
        I don't really know what router.events puts out, specifically, but anyways this fixes an issue where:
        If a menu is open, and then you navigate to a different url via using the sidebar, for example, the menu's become locked shut, because of some issue with the state of menu.isOpen not being properly closed.

        This, therefore, solves that, with closeMenus() any time the router does an event, resetting the menus.
      */
      this.closeMenus();
    })

  }

  private buildHeaderMenus(currentComponentMenu?: IHeaderMenu): IHeaderMenu[]{
    let newMenu: IHeaderMenu[] = [];
    let accountMenuItems: NavItem[] = [];

    let signOutMenuItem = new NavItem('Sign Out',null,null);
    signOutMenuItem.clickEmitted$.subscribe(()=>{
      this.authService.logout();
    })
    accountMenuItems.push(new NavItem('Settings','/user_settings',faCogs));
    accountMenuItems.push(signOutMenuItem);

    newMenu.push({ name: "Menu", isOpen: false, menuOpenSubscription: new Subscription(), menuItems: appMenuItems});
    newMenu.push({ name: "Account", isOpen: false, menuOpenSubscription: new Subscription(), menuItems: accountMenuItems});
    if(currentComponentMenu){
      newMenu.push(currentComponentMenu);
    }
    
    return newMenu;
  }


  onClickSidebarMenuButton(){
    this.sidebarButtonClicked.emit();
  }


  onClickHeaderMenu(headerMenu: IHeaderMenu){
    
    if(this.menuIsOpen){
      this.closeMenus();
    }else{
      this.openMenu(headerMenu);
    }
  }
  onMouseOverHeaderMenu(headerMenu: IHeaderMenu){
    if(this.menuIsOpen){
      this.openMenu(headerMenu);
    }else{

    }
  }
  onMouseLeaveHeaderMenu(headerMenu: IHeaderMenu){
    if(this.menuIsOpen){
      headerMenu.menuOpenSubscription.unsubscribe();
      let documentClickListener: Observable<Event> = fromEvent(document, 'click');
      headerMenu.menuOpenSubscription = documentClickListener.subscribe((click)=>{  
        this.closeMenus();
      })
    }else{

    }
  }

  private openMenu(headerMenu: IHeaderMenu){
    for(let menu of this.headerMenus){
      menu.isOpen = false;
    }
    headerMenu.isOpen = true;

  } 
  private closeMenus(){
    for(let menu of this.headerMenus){
      menu.isOpen = false;
      menu.menuOpenSubscription.unsubscribe();
    }
  }


}
