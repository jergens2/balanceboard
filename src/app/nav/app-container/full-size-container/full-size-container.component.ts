import { Component, OnInit } from '@angular/core';
import { UserAccountProfileService } from 'src/app/dashboard/user-account-profile/user-account-profile.service';
import { ToolboxService } from 'src/app/toolbox/toolbox.service';

@Component({
  selector: 'app-full-size-container',
  templateUrl: './full-size-container.component.html',
  styleUrls: ['./full-size-container.component.css']
})
export class FullSizeContainerComponent implements OnInit {

  constructor(private profileService: UserAccountProfileService, private toolboxService: ToolboxService) { }


  public get showToolbox(): boolean { return this.toolboxService.toolIsOpen; }
  public get sidebarIsPinned(): boolean { return this.profileService.appPreferences.sidebarIsPinned; }

  ngOnInit(): void {

  }



}
