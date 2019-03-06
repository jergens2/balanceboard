import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { HeaderMenu } from './header-menu/header-menu.model';
import { appMenuItems } from '../app-menu-items';
import { Subscription, Observable, fromEvent, Subscriber } from 'rxjs';
import { faBars, faCogs } from '@fortawesome/free-solid-svg-icons';
import { MenuItem } from './header-menu/menu-item.model';
import { HeaderService } from './header.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private headerService: HeaderService, private authService: AuthenticationService, private cdRef:ChangeDetectorRef) { }

  faBars = faBars;
  faCogs = faCogs;

  activeAppTool: string = null;

  headerMenus: HeaderMenu[] = [];
  private activeSubscriptions: Subscription[] = [];
  private closeMenuSubscription: Subscription = new Subscription();
  private documentClickListener: Observable<Event> = fromEvent(document, 'click');

  @Output() sidebarButtonClicked: EventEmitter<boolean> = new EventEmitter();

  private get menuIsOpen(): boolean {
    let anyOpen = false;
    for (let headerMenu of this.headerMenus) {
      if (headerMenu.isOpen) {
        return true;
      }
    }
    return anyOpen;
  }

  ngOnInit() {

    

    // this.closeMenuSubscription.unsubscribe();
    // this.closeMenuSubscription = this.headerService.closeMenus$.subscribe((value: boolean) => {
      // console.log("Header service closeMenus$ clicked")
      this.closeMenus();
      this.headerService.activeBalanceBoardComponentMenu$.subscribe((componentMenu: HeaderMenu) => {  
        this.closeMenuSubscription.unsubscribe();
        if (componentMenu != null) {
          this.headerMenus = this.buildHeaderMenus(componentMenu);
  
        } else {
  
          this.headerMenus = this.buildHeaderMenus();
   
        }
  
      });
    // });
    this.headerMenus = Object.assign([], this.buildHeaderMenus());
  }

  private buildHeaderMenus(currentComponentMenu?: HeaderMenu): HeaderMenu[] {
    this.activeSubscriptions.forEach((sub: Subscription) => {
      sub.unsubscribe();
    })
    this.activeSubscriptions = [];

    let newMenus: HeaderMenu[] = [];
    let accountMenuItems: MenuItem[] = [];

    let signOutMenuItem = new MenuItem('Sign Out', null, null);
    this.activeSubscriptions.push(signOutMenuItem.clickEmitted$.subscribe(() => {
      this.authService.logout();
    }));
    accountMenuItems.push(new MenuItem('Settings', '/user_settings', faCogs));
    accountMenuItems.push(signOutMenuItem);

    newMenus.push(new HeaderMenu('Menu', appMenuItems));
    newMenus.push(new HeaderMenu('Account', accountMenuItems));
    if (currentComponentMenu) {
      newMenus.push(currentComponentMenu);
    }

    return newMenus;
  }


  onClickSidebarMenuButton() {
    this.sidebarButtonClicked.emit();
  }


  onClickHeaderMenuName(headerMenu: HeaderMenu) {
    if (this.menuIsOpen) {
      this.closeMenus();
    } else {
      this.openMenu(headerMenu);
    }
  }

  onMouseOverHeaderMenu(headerMenu: HeaderMenu) {
    headerMenu.menuOpenSubscription.unsubscribe();
    if (this.menuIsOpen) {
      this.openMenu(headerMenu);
    } else {

    }
  }
  onMouseLeaveHeaderMenu(headerMenu: HeaderMenu) {

    if (this.menuIsOpen) {
      headerMenu.menuOpenSubscription.unsubscribe();
      headerMenu.menuOpenSubscription = this.documentClickListener.subscribe((click) => {
        console.log("closing because of click away")
        this.closeMenus();
      })
    } else {

    }
  }

  private openMenu(headerMenu: HeaderMenu) {
    for (let menu of this.headerMenus) {
      // menu.isOpen = false;
      menu.closeMenu();
    }
    headerMenu.isOpen = true;

  }

  private closeMenus() {
    console.log("Closing Menus")
    for(let headerMenu of this.headerMenus){
      // headerMenu.isOpen = false;
      headerMenu.closeMenu();
    }
    // this.headerMenus.forEach((headerMenu: HeaderMenu) => {
    //   // headerMenu.closeMenu();
    //   headerMenu.isOpen = false;
    // });
    // console.log("Is this.menuIsOpen?" , this.menuIsOpen);
    // this.cdRef.detectChanges();
  }


}
