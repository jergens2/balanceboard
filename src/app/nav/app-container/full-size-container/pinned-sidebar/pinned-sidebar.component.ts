import { Component, OnInit } from '@angular/core';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { UserAccountProfileService } from 'src/app/app-pages/user-account-profile/user-account-profile.service';

import { trigger, state, style, animate, transition, keyframes, } from '@angular/animations';
import { MenuItem } from '../header/header-menu/menu-item.class';
import { appMenuItems } from 'src/app/nav/app-menu-items';
import { timer } from 'rxjs';
import { DaybookDisplayService } from 'src/app/app-pages/daybook/daybook-display.service';
import { Router } from '@angular/router';
import { ToolType } from 'src/app/toolbox/tool-type.enum';
import { DaybookWidgetType } from 'src/app/app-pages/daybook/widgets/daybook-widget.class';
import { ToolboxService } from 'src/app/toolbox/toolbox.service';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { MenuItemType } from '../header/header-menu/menu-item-type.enum';

@Component({
  selector: 'app-pinned-sidebar',
  templateUrl: './pinned-sidebar.component.html',
  styleUrls: ['./pinned-sidebar.component.css'],
  animations: [
    trigger('appear', [
      state('appear', style({
        transform: 'translateX(0)',
        opacity: 1,
      })),
      state('disappear', style({
        transform: 'translateX(-100%)',
        opacity: 0.3,
      })),
      transition('void => *', [
        style({
          transform: 'translateX(-100%)',
          opacity: 0.3,
        }),
        animate(120, style({
          opacity: 1,
          transform: 'translateX(0)',
        }))
      ]),
      transition('* => disappear', [
        animate(120),
      ])
    ]),
  ]
})
export class PinnedSidebarComponent implements OnInit {

  constructor(
    private profileService: UserAccountProfileService,
    private daybookService: DaybookDisplayService,
    private router: Router,
    private toolboxService: ToolboxService,
    private authService: AuthenticationService,) { }

  private _mouseIsOver: boolean = false;
  private _isUnpinned: boolean = false;

  public get faChevronLeft() { return faChevronLeft; }
  public get menuItems(): MenuItem[] { return appMenuItems; }
  public get mouseIsOver(): boolean { return this._mouseIsOver; }
  public get isUnpinned(): boolean { return this._isUnpinned; }

  ngOnInit(): void {
  }

  public onClickUnpin() {
    this._isUnpinned = true;
    console.log("on click unpin")
    timer(120).subscribe(() => {
      this.profileService.appPreferences.sidebarIsPinned = false;
      console.log("saving changes")
      this.profileService.saveChanges$();
    })

  }

  public onMouseEnter() { this._mouseIsOver = true; }
  public onMouseLeave() { this._mouseIsOver = false; }


  public onClickMenuItem(menuItem: MenuItem) {
    if(menuItem.itemType === MenuItemType.LOGOUT){
      this.authService.logout();
    }
  }

  public onClickMenuItemTool(menuItem: MenuItem) {
    if (menuItem.isLogout) {
      this.authService.lock();
    } else if (menuItem.isTimelogEntry) {
      this.daybookService.setDaybookWidget(DaybookWidgetType.TIMELOG);
      this.router.navigate(['/daybook']);
      this.daybookService.onClickNowDelineator();
    } else {
      this.toolboxService.openTool(menuItem.sidebarTool);
    }
  }

}
