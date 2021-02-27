import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserAccountProfileService } from 'src/app/app-pages/user-account-profile/user-account-profile.service';
import { AppScreenSizeService } from 'src/app/shared/app-screen-size/app-screen-size.service';
import { ToolboxService } from 'src/app/toolbox/toolbox.service';

@Component({
  selector: 'app-full-size-container',
  templateUrl: './full-size-container.component.html',
  styleUrls: ['./full-size-container.component.css']
})
export class FullSizeContainerComponent implements OnInit {

  constructor(private profileService: UserAccountProfileService, private toolboxService: ToolboxService, private sizeService: AppScreenSizeService) { }


  public get showToolbox(): boolean { return this.toolboxService.toolIsOpen; }
  public get sidebarIsPinned(): boolean { return this.profileService.appPreferences.sidebarIsPinned; }


  /**
   * 
   * 2021-02-27
   * 
   * Kind of some angular specific behavior happening here, and this property isFullSize is required in the template in order to definitively 
   * tell the app to kill this DOM element if the following property is not true.
   * Without this in place, a weird thing happens where the full-size-container component won't allow further navigating.
   * If the app loads with full-size-container originally, then there are no problems.  but if you resize the window to smaller, 
   * or if the app starts on smaller, and then return to full-size-container,
   * at that point the routerLink elements no longer work.  the address bar in the web browser does change to the correct routerlink, 
   * but the <router-outlet></router-outlet> element seems to get stuck.
   * 
   * I presumed that this has something to with how angular manages the <router-outlet></router-outlet> element, combined with the fact 
   * that this app has 3 such outlets: mobile-container, tablet-container, full-size-container
   * 
   * By adding the isFullSize property to the element it appears to force the router outlet to 
   * do the required updating when clicking on the links.
   * 
   * 
   * For whatever reason, this behavior only appears to happen with full-size-container and not the other 2 containers.
   */
  public get isFullSize(): boolean { return this.sizeService.isFullSize; }

  ngOnInit(): void {

  }






}
