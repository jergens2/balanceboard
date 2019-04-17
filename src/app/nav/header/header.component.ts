import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { HeaderMenu } from './header-menu/header-menu.model';
import { appMenuItems } from '../app-menu-items';
import { Subscription, Observable, fromEvent, Subscriber } from 'rxjs';
import { faBars, faCogs } from '@fortawesome/free-solid-svg-icons';
import { MenuItem } from './header-menu/menu-item.model';
import { HeaderService } from './header.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';
import { ToolsService } from '../../tools/tools.service';
import { ToolComponents } from '../../tools/tool-components.enum';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(
    private headerService: HeaderService, 
    private authService: AuthenticationService, 
    private toolsService: ToolsService) { }

  faBars = faBars;
  faCogs = faCogs;

  activeAppTool: string = null;

  headerMenus: HeaderMenu[] = [];
  private activeSubscriptions: Subscription[] = [];
  // private closeMenuSubscription: Subscription = new Subscription();
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

    this.headerService.activeBalanceBoardComponentMenu$.subscribe((componentMenu: HeaderMenu) => {
      if (componentMenu != null) {
        this.headerMenus = Object.assign([], this.buildHeaderMenus(componentMenu)) ;
      } else {
        this.headerMenus = Object.assign([], this.buildHeaderMenus());
      }
    });
    this.headerMenus = Object.assign([], this.buildHeaderMenus());
  }

  private buildHeaderMenus(currentComponentMenu?: HeaderMenu): HeaderMenu[] {
    this.closeMenus();
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


    let toolsMenuItems: MenuItem[] = [];
    let notepadMenuItem: MenuItem = new MenuItem('Notepad', null, null);
    this.activeSubscriptions.push(notepadMenuItem.clickEmitted$.subscribe(()=>{
      this.toolsService.openTool(ToolComponents.Notepad);
    }))
    toolsMenuItems.push(notepadMenuItem);
    newMenus.push(new HeaderMenu('Tools', toolsMenuItems));


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

  onMouseOverHeaderMenuName(headerMenu: HeaderMenu) {
    headerMenu.menuOpenSubscription.unsubscribe();
    if (this.menuIsOpen) {
      this.openMenu(headerMenu);
    } else {

    }
  }
  onMouseLeaveHeaderMenuName(headerMenu: HeaderMenu) {

    if (this.menuIsOpen) {
      headerMenu.menuOpenSubscription.unsubscribe();
      headerMenu.menuOpenSubscription = this.documentClickListener.subscribe((click) => {
        this.closeMenus();
      })
    } else {

    }
  }

  private openMenu(headerMenu: HeaderMenu) {
    for (let menu of this.headerMenus) {
      if (menu.name != headerMenu.name) {
        menu.closeMenu();
      }
    }
    headerMenu.isOpen = true;
  }

  private closeMenus() {
    for (let headerMenu of this.headerMenus) {
      headerMenu.closeMenu();
    }
  }


}
