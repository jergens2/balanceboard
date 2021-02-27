import { Component, HostListener, OnInit, } from '@angular/core';
import { faPlus, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { appMenuItems } from 'src/app/nav/app-menu-items';
import { trigger, state, style, animate, transition, keyframes, } from '@angular/animations';
import { MenuItem } from '../header/header-menu/menu-item.class';
import { ToolType } from 'src/app/toolbox/tool-type.enum';
import { DaybookWidgetType } from 'src/app/app-pages/daybook/widgets/daybook-widget.class';
import { DaybookDisplayService } from 'src/app/app-pages/daybook/daybook-display.service';
import { ToolboxService } from 'src/app/toolbox/toolbox.service';
import { Router } from '@angular/router';
import { UserAccountProfileService } from 'src/app/app-pages/user-account-profile/user-account-profile.service';
import { AuthenticationService } from 'src/app/authentication/authentication.service';


@Component({
  selector: 'app-mini-sidebar',
  templateUrl: './mini-sidebar.component.html',
  styleUrls: ['./mini-sidebar.component.css'],
  animations: [
    trigger('appear', [
      state('appear', style({ 
        transform: 'translateX(0)', 
        padding: '35px',
        paddingLeft: '15px', 
      })),
      transition('void => *', [
        style({
          transform: 'translateX(-165px)',
          opacity: 0.3,
          padding: '15px',
          paddingLeft: '15px', 
        }),
        animate(120, )
      ]),
      transition('* => void', [
        animate(120, style({
          transform: 'translateX(-165px)',
          opacity: 0.3,
          // color: 'white',
          // padding: '15px',
          // paddingLeft: '15px', 
        }))
      ])
    ]),

    // trigger('')
  ]
})
export class MiniSidebarComponent implements OnInit {

  constructor(
    private daybookService: DaybookDisplayService, 
    private toolboxService: ToolboxService,
    private profileService: UserAccountProfileService,
    private authService: AuthenticationService,
    private router: Router) { }

  public get faPlus() { return faPlus; }
  public get faThumbtack() { return faThumbtack }
  public get menuItems(): MenuItem[] { return appMenuItems; }

  ngOnInit(): void {

  }


  private _mouseIsOver: boolean = false;
  public onMouseEnter() { this._mouseIsOver = true; }
  public onMouseLeave() { this._mouseIsOver = false; }
  @HostListener('mouseleave', ['$event.target']) hostListenerMouseLeave() { this.onMouseLeave(); }
  public get mouseIsOver(): boolean { return this._mouseIsOver; }

  // public onClickMenuItem(menuItem: MenuItem) {
  //   console.log("ITEM CLICKED: " , menuItem.itemType)
  //   if (menuItem.sidebarToolComponentMouseOver) {
  //     if (menuItem.hasSidebarToolComponent) {
  //       if (menuItem.sidebarTool === ToolType.TIMELOG_ENTRY) {
  //         this.daybookService.setDaybookWidget(DaybookWidgetType.TIMELOG);
  //         this.router.navigate(['/daybook']);
  //         this.daybookService.onClickNowDelineator();
  //       } else if(menuItem.sidebarTool === ToolType.LOCK){
          
  //       } else {
  //         this.toolboxService.openTool(menuItem.sidebarTool);
  //       }
  //     }
  //   } else {
  //     this.router.navigate([menuItem.routerLink]);
  //   }
  // }

  public onClickMenuItemTool(menuItem: MenuItem){
    if(menuItem.isLogout){
      this.authService.lock();
    }else if(menuItem.isTimelogEntry){
          this.daybookService.setDaybookWidget(DaybookWidgetType.TIMELOG);
          this.router.navigate(['/daybook']);
          this.daybookService.onClickNowDelineator();
    }else{
      this.toolboxService.openTool(menuItem.sidebarTool);
    }
  }


  public onClickPin(){
    this.profileService.appPreferences.sidebarIsPinned = true;
    this.profileService.saveChanges$();
  }

}
