import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { faCogs, faSignOutAlt, faPlus, faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { MenuItem } from '../header/header-menu/menu-item.model';
import { appMenuItems } from '../app-menu-items';
import { Modal } from '../../modal/modal.class';
import { IModalOption } from '../../modal/modal-option.interface';
import { ModalComponentType } from '../../modal/modal-component-type.enum';
import { ModalService } from '../../modal/modal.service';
import { ToolboxService } from '../../toolbox-menu/toolbox.service';
import { ToolType } from '../../toolbox-menu/tool-type.enum';
import { DaybookDisplayService } from '../../dashboard/daybook/daybook-display.service';
import { DaybookWidgetType } from '../../dashboard/daybook/widgets/daybook-widget.class';
import { BackgroundImageService } from '../../shared/background-image.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthenticationService,
    private router: Router,
    private modalService: ModalService,
    private toolsService: ToolboxService,
    private daybookService: DaybookDisplayService,
    private bgService: BackgroundImageService) { }


  faPlus = faPlus;
  faCogs = faCogs;
  faSignOutAlt = faSignOutAlt;
  faUser = faUser;
  public faLock = faLock;


  activeLink = { color: 'red' };
  // private _authStatus: AuthStatus = null;
  menuItems: MenuItem[];


  // nightMode: UserSetting = null;

  public get email(): string[] {
    let email = this.authService.userEmail;
    let split: string[] = [];
    if (email.length > 16) {
      split = email.split('@');
      if (split.length === 2) {
        let emailName = split[0];
        let emailDomain = '@' + split[1];
        return [emailName, emailDomain];
      } else {
        return [this.authService.userEmail];
      }
    }
    return [this.authService.userEmail];
  }
  public get userId(): string { return this.authService.userId; }
  public get username(): string { return this.authService.username; }
  public get hasUsername(): boolean { return this.authService.hasUsername; }

  ngOnInit() {
    this.menuItems = appMenuItems;



  }

  public onClickMenuItem(menuItem: MenuItem) {
    if (menuItem.sidebarToolComponentMouseOver) {
      if (menuItem.sidebarToolComponent) {
        if (menuItem.sidebarToolComponent === ToolType.TIMELOG_ENTRY) {
          this.daybookService.setDaybookWidget(DaybookWidgetType.TIMELOG);
          this.router.navigate(['/daybook']);
          this.daybookService.onClickNowDelineator();
        } else {
          this.toolsService.openTool(menuItem.sidebarToolComponent);
        }
      } else {
        this.toolsService.openTool(menuItem.sidebarToolComponent);
      }

    } else {
      this.router.navigate([menuItem.routerLink]);
    }

  }

  public onMouseEnterSidebarNewItemButton(menuItem: MenuItem) {
    menuItem.sidebarToolComponentMouseOver = true;
  }
  public onMouseLeaveSidebarNewItemButton(menuItem: MenuItem) {
    menuItem.sidebarToolComponentMouseOver = false;
  }



  get routerLinkActiveClass(): string {
    // if(this.nightMode.booleanValue){
    //   return "active-link-night-mode";
    // }else{
    return "active-link";
    // }
  }


  onClick(button: string) {
    this.router.navigate(['/' + button]);
  }
  onClickContact(){
    this.router.navigate(['/user-account'])
  }

  onClickLogout() {
    console.log("OnclickLogout()")
    if(!this._isLocking){
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
      // this._modalSubscription = 
      this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
        if (selectedOption.value == "Logout") {
          this.logout();
        } else if (selectedOption.value == "Cancel") {
        } else {
          //error 
        }
      });
      this.modalService.openModal(modal);
    }
    

  }

  ngOnDestroy() {

  }

  private _isLocking: boolean = false;
  public onClickLock(){
    console.log("Locking!")
    this._isLocking = true;
    this.bgService.getNewRandomImage();
    this.authService.lock();
  }

  private logout() {
    console.log("Logging out")
    this.authService.logout();

  }

}
