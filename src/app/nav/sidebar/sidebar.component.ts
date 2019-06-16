import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { faCogs, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { MenuItem } from '../header/header-menu/menu-item.model';
import { appMenuItems } from '../app-menu-items';
import { AuthStatus } from '../../authentication/auth-status.class';
import { Subscription } from 'rxjs';
import { UserSettingsService } from '../../shared/document-definitions/user-account/user-settings/user-settings.service';
import { UserSetting } from '../../shared/document-definitions/user-account/user-settings/user-setting.model';
import { UserAccount } from '../../shared/document-definitions/user-account/user-account.class';
import { Modal } from '../../modal/modal.class';
import { IModalOption } from '../../modal/modal-option.interface';
import { ModalComponentType } from '../../modal/modal-component-type.enum';
import { ModalService } from '../../modal/modal.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private authService: AuthenticationService, private userSettingsService: UserSettingsService, private router: Router, private modalService:ModalService) { }



  faCogs = faCogs;
  faSignOutAlt = faSignOutAlt;


  activeLink = { color: 'red' };
  private authStatus: AuthStatus = null;
  private authSubscription: Subscription = new Subscription();
  user: UserAccount = null;

  menuItems: MenuItem[];


  nightMode: UserSetting = null;

  ngOnInit() {
    this.menuItems = appMenuItems;

    this.userSettingsService.userSettings$.subscribe((userSettings: UserSetting[])=>{

      for(let setting of userSettings){
        if(setting.name == "night_mode"){
          this.nightMode = setting;
        }
      }
    })

    this.authSubscription = this.authService.authStatus$.subscribe((authStatus: AuthStatus)=>{
      if(authStatus != null){
        if(authStatus.user != null){
          this.authStatus = authStatus;
          this.user = this.authStatus.user;
        }
      }
    })

  }

  get routerLinkActiveClass(): string {
    if(this.nightMode.booleanValue){
      return "active-link-night-mode";
    }else{
      return "active-link";
    }
  }


  onClick(button: string){
    this.router.navigate(['/' + button]);
  }

  onClickLogout(){

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
    // this._modalSubscription = 
    this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
      if (selectedOption.value == "Logout") {
        this.logout();

      } else if (selectedOption.value == "Cancel") {

      } else {
        //error 
      }
    });
    this.modalService.activeModal = modal;

  }

  private logout(){
    this.user = null;
    this.authStatus = null;
    this.authSubscription.unsubscribe();
    this.authService.logout();
  }

}
