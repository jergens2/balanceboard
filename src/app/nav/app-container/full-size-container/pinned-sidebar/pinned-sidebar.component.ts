import { Component, OnInit } from '@angular/core';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { UserAccountProfileService } from 'src/app/dashboard/user-account-profile/user-account-profile.service';

@Component({
  selector: 'app-pinned-sidebar',
  templateUrl: './pinned-sidebar.component.html',
  styleUrls: ['./pinned-sidebar.component.css']
})
export class PinnedSidebarComponent implements OnInit {

  constructor(private profileService: UserAccountProfileService) { }

  public get faChevronLeft() { return faChevronLeft; }

  ngOnInit(): void {
  }

  public onClickUnpin() {
    this.profileService.appPreferences.sidebarIsPinned = false;
    this.profileService.saveChanges$();
  }

}
