import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { HeaderMenu } from './header-menu/header-menu.model';
import { appMenuItems } from '../app-menu-items';
import { Subscription, Observable, fromEvent, Subscriber } from 'rxjs';
import { faBars, faCogs, faSignOutAlt, faTools, faWrench, faTable, faCalendarAlt, faTasks, faUsers, IconDefinition, faBatteryEmpty, faBatteryQuarter, faBatteryHalf, faBatteryThreeQuarters, faBatteryFull } from '@fortawesome/free-solid-svg-icons';
import { MenuItem } from './header-menu/menu-item.model';
import { HeaderService } from './header.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';
import { ToolboxService } from '../../toolbox-menu/toolbox.service';
import { ToolType } from '../../toolbox-menu/tool-type.enum';
import { IModalOption } from '../../modal/modal-option.interface';
import { ModalComponentType } from '../../modal/modal-component-type.enum';
import { Modal } from '../../modal/modal.class';
import { ModalService } from '../../modal/modal.service';
import { faCheckCircle, faStickyNote } from '@fortawesome/free-regular-svg-icons';
import { DaybookControllerService } from '../../dashboard/daybook/controller/daybook-controller.service';
import * as moment from 'moment';
import { DaybookWidgetType } from '../../dashboard/daybook/widgets/daybook-widget.class';
import { DaybookDisplayService } from '../../dashboard/daybook/daybook-display.service';
import { TimelogEntryFormService } from '../../dashboard/daybook/widgets/timelog/timelog-entry-form/timelog-entry-form.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(
    private headerService: HeaderService,
    private authService: AuthenticationService,
    private toolsService: ToolboxService,
    private modalService: ModalService,
    private daybookDisplayService: DaybookDisplayService,
    private router: Router) { }

  faBars = faBars;
  faCogs = faCogs;
  faUsers = faUsers;

  private _batteryIcon: IconDefinition;
  private _batteryNgClass: string;
  private _batteryPercent: string = "";
  

  activeAppTool: string = null;

  headerMenus: HeaderMenu[] = [];
  private activeSubscriptions: Subscription[] = [];
  // private closeMenuSubscription: Subscription = new Subscription();
  private documentClickListener: Observable<Event> = fromEvent(document, 'click');

  public get batteryIcon(): IconDefinition { return this._batteryIcon; }
  public get batteryPercent(): string { return this._batteryPercent; }
  public get batteryNgClass(): string { return this._batteryNgClass; }
  public get clock(): moment.Moment { return this.daybookDisplayService.clock; }

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
        this.headerMenus = Object.assign([], this._buildHeaderMenus(componentMenu));
      } else {
        this.headerMenus = Object.assign([], this._buildHeaderMenus());
      }
    });
    this.headerMenus = Object.assign([], this._buildHeaderMenus());

    this._setBattery();
    this.daybookDisplayService.displayUpdated$.subscribe((item) => {
      this._setBattery();
    });

    
  }

  public onClickClock(){
    this.daybookDisplayService.setDaybookWidget(DaybookWidgetType.TIMELOG);
    this.router.navigate(['/daybook']);
    this.daybookDisplayService.openNewCurrentTimelogEntry();
  }
  public onClickBattery(){
    this.daybookDisplayService.setDaybookWidget(DaybookWidgetType.SLEEP_PROFILE);
    this.router.navigate(['/daybook']);
  }

  private _buildHeaderMenus(currentComponentMenu?: HeaderMenu): HeaderMenu[] {
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
      let modal: Modal = new Modal("Logout?", "Confirm: logout?", null, options, {}, ModalComponentType.Confirm);
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
    this.activeSubscriptions.push(notepadMenuItem.clickEmitted$.subscribe(() => {
      this.toolsService.openTool(ToolType.NOTEBOOK_ENTRY);
    }));
    let actionItemMenuItem: MenuItem = new MenuItem("Action Item", null, faCheckCircle);
    this.activeSubscriptions.push(actionItemMenuItem.clickEmitted$.subscribe(() => {
      this.toolsService.openTool(ToolType.ACTION_ITEM);
    }));
    let timelogEntryMenuItem: MenuItem = new MenuItem("Timelog Entry", null, faTable);
    this.activeSubscriptions.push(timelogEntryMenuItem.clickEmitted$.subscribe(() => {
      this.toolsService.openTool(ToolType.TIMELOG_ENTRY);
    }));
    let futureEventMenuItem: MenuItem = new MenuItem("Appointment / Future Event", null, faCalendarAlt);
    this.activeSubscriptions.push(futureEventMenuItem.clickEmitted$.subscribe(() => {
      this.toolsService.openTool(ToolType.FUTURE_EVENT);
    }));
    let dailyTaskListMenuItem: MenuItem = new MenuItem("Daily Task List", null, faTasks);
    this.activeSubscriptions.push(dailyTaskListMenuItem.clickEmitted$.subscribe(() => {
      this.toolsService.openTool(ToolType.DAILY_TASK_LIST);
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

  private _setBattery() {
    const batteryLevel: number = this.daybookDisplayService.batteryLevel
    if (batteryLevel >= 0 && batteryLevel < 0.125) {
      this._batteryIcon = faBatteryEmpty;
      this._batteryNgClass = 'battery-empty';
    }
    else if (batteryLevel >= 0.125 && batteryLevel < 0.375) {
      this._batteryIcon = faBatteryQuarter;
      this._batteryNgClass = 'battery-quarter';
    }
    else if (batteryLevel >= 0.375 && batteryLevel < 0.625) {
      this._batteryIcon = faBatteryHalf;
      this._batteryNgClass = 'battery-half';
    }
    else if (batteryLevel >= 0.625 && batteryLevel < 0.875) {
      this._batteryIcon = faBatteryThreeQuarters;
      this._batteryNgClass = 'battery-three-quarters';
    }
    else if (batteryLevel >= 0.875 && batteryLevel <= 1) {
      this._batteryIcon = faBatteryFull;
      this._batteryNgClass = 'battery-full';
    } else {
      console.log('Error with battery: ' + batteryLevel)
      this._batteryNgClass = '';
      this._batteryIcon = null;
    }
    // console.log("battery ng class" + this.batteryNgClass)
    this._batteryPercent = (batteryLevel * 100).toFixed(0);
  }

  private logout() {
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
