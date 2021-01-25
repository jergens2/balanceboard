import { Component, HostListener, OnInit, } from '@angular/core';
import { faPlus, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { appMenuItems } from 'src/app/nav/app-menu-items';
import { trigger, state, style, animate, transition, keyframes, } from '@angular/animations';
import { MenuItem } from '../header/header-menu/menu-item.class';
import { ToolType } from 'src/app/toolbox/tool-type.enum';
import { DaybookWidgetType } from 'src/app/dashboard/daybook/widgets/daybook-widget.class';
import { DaybookDisplayService } from 'src/app/dashboard/daybook/daybook-display.service';
import { ToolboxService } from 'src/app/toolbox/toolbox.service';
import { Router } from '@angular/router';
import { UserAccountProfileService } from 'src/app/dashboard/user-account-profile/user-account-profile.service';


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
          opacity: 0.1,
          padding: '15px',
          paddingLeft: '15px', 
        }),
        animate(105, style({
          opacity: 1,
          transform: 'translateX(0)',
          padding: '35px',
          paddingLeft: '15px', 
        }))
      ]),
      transition('* => void', [
        animate(150, style({
          transform: 'translateX(-165px)',
          opacity: 0.1,
          // color: 'white',
          padding: '15px',
          paddingLeft: '15px', 
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

  public onClickMenuItem(menuItem: MenuItem) {
    if (menuItem.sidebarToolComponentMouseOver) {
      if (menuItem.sidebarToolComponent) {
        if (menuItem.sidebarToolComponent === ToolType.TIMELOG_ENTRY) {
          this.daybookService.setDaybookWidget(DaybookWidgetType.TIMELOG);
          this.router.navigate(['/daybook']);
          this.daybookService.onClickNowDelineator();

        } else {
          this.toolboxService.openTool(menuItem.sidebarToolComponent);
        }
      } else {
        this.toolboxService.openTool(menuItem.sidebarToolComponent);
      }

    } else {
      this.router.navigate([menuItem.routerLink]);
    }
  }


  public onClickPin(){
    this.profileService.appPreferences.sidebarIsPinned = true;
    this.profileService.saveChanges$();
  }

}
