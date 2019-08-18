import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { HeaderMenu } from './header-menu/header-menu.model';
import { appMenuItems } from '../app-menu-items';
import { Subscription, Observable, fromEvent, Subscriber } from 'rxjs';
import { faBars, faCogs, faSignOutAlt, faTools, faWrench, faTable, faCalendarAlt, faTasks, faUsers } from '@fortawesome/free-solid-svg-icons';
import { MenuItem } from './header-menu/menu-item.model';
import { HeaderService } from './header.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';
import { ToolsService } from '../../tools-menu/tools/tools.service';
import { ToolComponents } from '../../tools-menu/tools/tool-components.enum';
import { IModalOption } from '../../modal/modal-option.interface';
import { ModalComponentType } from '../../modal/modal-component-type.enum';
import { Modal } from '../../modal/modal.class';
import { ModalService } from '../../modal/modal.service';
import { faCheckCircle, faStickyNote } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(
    private headerService: HeaderService, 
    private authService: AuthenticationService, 
    private toolsService: ToolsService,
    private modalService: ModalService) { }

  faBars = faBars;
  faCogs = faCogs;
  faUsers = faUsers;

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

    let signOutMenuItem = new MenuItem('Sign Out', null, faSignOutAlt);
    this.activeSubscriptions.push(signOutMenuItem.clickEmitted$.subscribe(() => {
      let options: IModalOption[] = [
        {
          value: "Logout",
          dataObject: null,
        },
        {
          value: "Cancel",
          dataObject: null,
        }
      ];
      let modal: Modal = new Modal("Logout?", "Confirm: logout?", null, options, {}, ModalComponentType.Confirm );
      modal.headerIcon = faSignOutAlt;

      this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
        if (selectedOption.value == "Logout") {
          this.logout();
  
        } else if (selectedOption.value == "Cancel") {
  
        } else {
          //error 
        }
      });
      this.modalService.activeModal = modal;
    }));

    newMenus.push(new HeaderMenu('Menu', appMenuItems.concat([new MenuItem('Settings', '/user-settings', faCogs), signOutMenuItem])));


    /*
      Tools Menu
    */
    let toolsMenuItems: MenuItem[] = [];

    let notepadMenuItem: MenuItem = new MenuItem('Notebook Entry', null, faStickyNote);
    this.activeSubscriptions.push(notepadMenuItem.clickEmitted$.subscribe(()=>{
      this.toolsService.openTool(ToolComponents.Notepad);
    }));
    let actionItemMenuItem: MenuItem = new MenuItem("Action Item", null, faCheckCircle);
    this.activeSubscriptions.push(actionItemMenuItem.clickEmitted$.subscribe(()=>{
      this.toolsService.openTool(ToolComponents.ActionItem);
    }));
    let timelogEntryMenuItem: MenuItem = new MenuItem("Timelog Entry", null, faTable);
    this.activeSubscriptions.push(timelogEntryMenuItem.clickEmitted$.subscribe(()=>{
      this.toolsService.openTool(ToolComponents.TimelogEntry);
    }));
    let futureEventMenuItem: MenuItem = new MenuItem("Appointment / Future Event", null, faCalendarAlt);
    this.activeSubscriptions.push(futureEventMenuItem.clickEmitted$.subscribe(()=>{
      this.toolsService.openTool(ToolComponents.FutureEvent);
    }));
    let dailyTaskListMenuItem: MenuItem = new MenuItem("Daily Task List", null, faTasks);
    this.activeSubscriptions.push(dailyTaskListMenuItem.clickEmitted$.subscribe(()=>{
      this.toolsService.openTool(ToolComponents.DailyTaskList);
    }));

    toolsMenuItems.push(notepadMenuItem);
    toolsMenuItems.push(actionItemMenuItem);
    toolsMenuItems.push(timelogEntryMenuItem);
    toolsMenuItems.push(futureEventMenuItem);
    toolsMenuItems.push(dailyTaskListMenuItem);
    
    let toolsMenu: HeaderMenu = new HeaderMenu('Tools', toolsMenuItems);
    toolsMenu.icon = faWrench;
    newMenus.push(toolsMenu);

    /*
    End of tools menu
    */



    if (currentComponentMenu) {
      newMenus.push(currentComponentMenu);
    }
    return newMenus;
  }

  private logout(){
    this.activeSubscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.activeSubscriptions = [];
    this.authService.logout();
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
