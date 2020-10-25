import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { HeaderMenu } from './header-menu/header-menu.model';
import { appMenuItems } from '../app-menu-items';
import { Subscription, Observable, fromEvent, Subscriber, timer, Subject } from 'rxjs';
import { faBars, faCogs, faSignOutAlt, faTools, faWrench, faTable, faCalendarAlt, faTasks, faUsers, IconDefinition, faBatteryEmpty, faBatteryQuarter, faBatteryHalf, faBatteryThreeQuarters, faBatteryFull } from '@fortawesome/free-solid-svg-icons';
import { MenuItem } from './header-menu/menu-item.model';
import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';
import { ToolboxService } from '../../toolbox-menu/toolbox.service';
import { ToolType } from '../../toolbox-menu/tool-type.enum';
import { IModalOption } from '../../modal/modal-option.interface';
import { ModalComponentType } from '../../modal/modal-component-type.enum';
import { Modal } from '../../modal/modal.class';
import { ModalService } from '../../modal/modal.service';
import { faCheckCircle, faStickyNote } from '@fortawesome/free-regular-svg-icons';
import * as moment from 'moment';
import { DaybookWidgetType } from '../../dashboard/daybook/widgets/daybook-widget.class';
import { DaybookDisplayService } from '../../dashboard/daybook/daybook-display.service';
import { SleepService } from '../../dashboard/daybook/sleep-manager/sleep.service';
import { Clock } from '../../shared/time-utilities/clock.class';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthenticationService,
    private toolsService: ToolboxService,
    private modalService: ModalService,
    private daybookDisplayService: DaybookDisplayService,
    private sleepService: SleepService,
    private router: Router) { }

  faBars = faBars;
  faCogs = faCogs;
  faUsers = faUsers;

  private _batteryIcon: IconDefinition;
  private _batteryNgClass: string;
  private _batteryPercent: string = '';
  private _clock: Clock;

  activeAppTool: string = null;

  headerMenus: HeaderMenu[] = [];
  private _menuSubs: Subscription[] = [];
  // private closeMenuSubscription: Subscription = new Subscription();
  private documentClickListener: Observable<Event> = fromEvent(document, 'click');

  public get batteryIcon(): IconDefinition { return this._batteryIcon; }
  public get batteryPercent(): string { return this._batteryPercent; }
  public get batteryNgClass(): string { return this._batteryNgClass; }
  public get clockTime(): moment.Moment { return this._clock.currentTime; }

  @Output() sidebarButtonClicked: EventEmitter<boolean> = new EventEmitter();

  private get menuIsOpen(): boolean {
    const anyOpen = false;
    for (const headerMenu of this.headerMenus) {
      if (headerMenu.isOpen) {
        return true;
      }
    }
    return anyOpen;
  }






  private _energySub: Subscription = new Subscription();

  ngOnInit() {
    this._clock = new Clock();
    this.headerMenus = Object.assign([], this._buildHeaderMenus());
    this._setBattery();
    this._energySub = this.sleepService.sleepManager.energyLevel$.subscribe(energy => { this._setBattery(); });
  }

  ngOnDestroy() {
    this._menuSubs.forEach(s => s.unsubscribe());
    this._menuSubs = [];
    this._menuSubs.forEach(s => s.unsubscribe());
    this._menuSubs = [];
    this._energySub.unsubscribe();
  }

  public onClickClock() {
    this.daybookDisplayService.setDaybookWidget(DaybookWidgetType.TIMELOG);
    this.router.navigate(['/daybook']);
  }
  public onClickBattery() {
    this.daybookDisplayService.setDaybookWidget(DaybookWidgetType.SLEEP_PROFILE);
    this.router.navigate(['/daybook']);
  }


  private _buildHeaderMenus(currentComponentMenu?: HeaderMenu): HeaderMenu[] {
    this.closeMenus();
    this._menuSubs.forEach(s => s.unsubscribe());
    this._menuSubs = [];
    const newMenus: HeaderMenu[] = [];
    const signOutMenuItem = new MenuItem('Sign Out', null, faSignOutAlt);
    const signOutSub = signOutMenuItem.clickEmitted$.subscribe(() => {
      const options: IModalOption[] = [
        {
          value: 'Logout',
          dataObject: null,
        },
        {
          value: 'Cancel',
          dataObject: null,
        }
      ];
      const modal: Modal = new Modal('Logout?', 'Confirm: logout?', null, options, {}, ModalComponentType.Confirm);
      modal.headerIcon = faSignOutAlt;

      this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
        if (selectedOption.value === 'Logout') { this.logout(); } else if (selectedOption.value == 'Cancel') {
        } else {
          //error 
        }
      });
      this.modalService.openModal(modal);
    });
    newMenus.push(new HeaderMenu('Menu', appMenuItems.concat([new MenuItem('Settings', '/user-settings', faCogs), signOutMenuItem])));

    const notepadMenuItem: MenuItem = new MenuItem('Notebook Entry', null, faStickyNote);
    const actionItemMenuItem: MenuItem = new MenuItem('Action Item', null, faCheckCircle);
    const timelogEntryMenuItem: MenuItem = new MenuItem('Timelog Entry', null, faTable);
    const futureEventMenuItem: MenuItem = new MenuItem('Appointment / Future Event', null, faCalendarAlt);
    const dailyTaskListMenuItem: MenuItem = new MenuItem('Daily Task List', null, faTasks);
    this._menuSubs = [
      signOutSub,
      notepadMenuItem.clickEmitted$.subscribe(c => this.toolsService.openTool(ToolType.NOTEBOOK_ENTRY)),
      actionItemMenuItem.clickEmitted$.subscribe(c => this.toolsService.openTool(ToolType.ACTION_ITEM)),
      timelogEntryMenuItem.clickEmitted$.subscribe(c => this.toolsService.openTool(ToolType.TIMELOG_ENTRY)),
      futureEventMenuItem.clickEmitted$.subscribe(c => this.toolsService.openTool(ToolType.FUTURE_EVENT)),
      dailyTaskListMenuItem.clickEmitted$.subscribe(c => this.toolsService.openTool(ToolType.DAILY_TASK_LIST)),
    ];

    const toolsMenuItems: MenuItem[] = [
      notepadMenuItem,
      actionItemMenuItem,
      timelogEntryMenuItem,
      futureEventMenuItem,
      dailyTaskListMenuItem
    ];

    const toolsMenu: HeaderMenu = new HeaderMenu('Tools', toolsMenuItems);
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
    // console.log("Setting the battery.  value from sleep service:")
    // console.log(this.sleepService.sleepManager.getEnergyLevel())
    const batteryLevel = this.sleepService.sleepManager.energyLevel;
    // console.log("Battery level: " , batteryLevel)
    if (batteryLevel >= 0 && batteryLevel < 12.5) {
      this._batteryIcon = faBatteryEmpty;
      this._batteryNgClass = 'battery-empty';
    } else if (batteryLevel >= 12.5 && batteryLevel < 37.5) {
      this._batteryIcon = faBatteryQuarter;
      this._batteryNgClass = 'battery-quarter';
    } else if (batteryLevel >= 37.5 && batteryLevel < 62.5) {
      this._batteryIcon = faBatteryHalf;
      this._batteryNgClass = 'battery-half';
    } else if (batteryLevel >= 62.5 && batteryLevel < 87.5) {
      this._batteryIcon = faBatteryThreeQuarters;
      this._batteryNgClass = 'battery-three-quarters';
    } else if (batteryLevel >= 87.5 && batteryLevel <= 100) {
      this._batteryIcon = faBatteryFull;
      this._batteryNgClass = 'battery-full';
    } else {
      console.log('Error with battery: ' + batteryLevel)
      this._batteryNgClass = '';
      this._batteryIcon = null;
    }
    // console.log("battery ng class" + this.batteryNgClass)
    this._batteryPercent = (batteryLevel).toFixed(0);
  }

  private logout() {
    this._menuSubs.forEach(s => s.unsubscribe());
    this._menuSubs = [];
    this._energySub.unsubscribe();
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
    for (const menu of this.headerMenus) {
      if (menu.name != headerMenu.name) {
        menu.closeMenu();
      }
    }
    headerMenu.isOpen = true;
  }

  private closeMenus() {
    for (const headerMenu of this.headerMenus) {
      headerMenu.closeMenu();
    }
  }


}
