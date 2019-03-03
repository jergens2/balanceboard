import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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

  constructor(private headerService: HeaderService, private authService: AuthenticationService, private router: Router) { }

  faBars = faBars;
  faCogs = faCogs;

  activeAppTool: string = null;

  headerMenus: HeaderMenu[] = [];
  private activeSubscriptions: Subscription[] = [];
  private closeMenuSubscription: Subscription = new Subscription();

  @Output() sidebarButtonClicked: EventEmitter<boolean> = new EventEmitter();

  private get menuIsOpen(): boolean {
    let anyOpen = false;
    for (let headerMenu of this.headerMenus) {
      if (headerMenu.isOpen) {
        return headerMenu.isOpen;
      }
    }
    return anyOpen;
  }

  ngOnInit() {

    this.headerMenus = this.buildHeaderMenus();
    this.headerService.activeBalanceBoardComponentMenu$.subscribe((componentMenu: HeaderMenu) => {
      this.closeMenus();

      this.closeMenuSubscription.unsubscribe();
      if (componentMenu != null) {
        this.headerMenus = this.buildHeaderMenus(componentMenu);

      } else {

        this.headerMenus = this.buildHeaderMenus();

      }

    });
    this.closeMenuSubscription = this.headerService.closeMenus$.subscribe((value: boolean) => {
      console.log("closing menu subscri[diasdoadjo")
      this.closeMenus();

    })

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


  onClickHeaderMenu(headerMenu: HeaderMenu) {
    if (this.menuIsOpen) {
      this.closeMenus();
    } else {
      this.openMenu(headerMenu);
    }
  }

  onMouseOverHeaderMenu(headerMenu: HeaderMenu) {
    if (this.menuIsOpen) {
      this.openMenu(headerMenu);
    } else {

    }
  }
  onMouseLeaveHeaderMenu(headerMenu: HeaderMenu) {
    if (this.menuIsOpen) {
      headerMenu.menuOpenSubscription.unsubscribe();
      let documentClickListener: Observable<Event> = fromEvent(document, 'click');
      headerMenu.menuOpenSubscription = documentClickListener.subscribe((click) => {
        this.closeMenus();
      })
    } else {

    }
  }

  private openMenu(headerMenu: HeaderMenu) {
    for (let menu of this.headerMenus) {
      menu.isOpen = false;
    }
    headerMenu.isOpen = true;

  }

  private closeMenus() {
    this.headerMenus.forEach((headerMenu: HeaderMenu) => {
      headerMenu.closeMenu();
    });
  }


}
