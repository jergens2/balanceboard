import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { IHeaderMenu } from './header-menu/header-menu.interface';
import { appMenuItems } from '../app-menu-items';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { faBars, faCogs } from '@fortawesome/free-solid-svg-icons';
import { NavItem } from '../nav-item.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor() { }

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

    let accountMenuItems: NavItem[] = [];
    accountMenuItems.push(new NavItem('Settings','/user_settings',faCogs));
    accountMenuItems.push(new NavItem('Sign Out','',null));

    this.headerMenus.push({ name: "Menu", isOpen: false, menuOpenSubscription: new Subscription(), menuItems: appMenuItems});
    this.headerMenus.push({ name: "Account", isOpen: false, menuOpenSubscription: new Subscription(), menuItems: accountMenuItems});
    this.headerMenus.push({ name: "Daybook", isOpen: false, menuOpenSubscription: new Subscription(), menuItems: appMenuItems});

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
