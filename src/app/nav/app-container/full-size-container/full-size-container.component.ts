import { Component, OnInit } from '@angular/core';
import { UserAccountProfileService } from 'src/app/dashboard/user-account-profile/user-account-profile.service';

@Component({
  selector: 'app-full-size-container',
  templateUrl: './full-size-container.component.html',
  styleUrls: ['./full-size-container.component.css']
})
export class FullSizeContainerComponent implements OnInit {

  constructor(private profileService: UserAccountProfileService) { }

  public get sidebarIsPinned(): boolean { return this.profileService.appPreferences.sidebarIsPinned; }

  ngOnInit(): void {

  }



}
