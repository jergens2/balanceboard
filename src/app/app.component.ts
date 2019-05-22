import { Component, OnInit, HostListener } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthStatus } from './authentication/auth-status.model';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { UserSettingsService } from './user-settings/user-settings.service';
import { UserSetting } from './user-settings/user-setting.model';
import { ModalService } from './modal/modal.service';
import { Modal } from './modal/modal.model';
import { ToolsService } from './nav/header/tools/tools.service';
import { ToolComponents } from './nav/header/tools/tool-components.enum';
import { SizeService } from './shared/app-screen-size/size.service';
import { AppScreenSize } from './shared/app-screen-size/app-screen-size.enum';
import { OnScreenSizeChanged } from './shared/app-screen-size/on-screen-size-changed.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnScreenSizeChanged {

  faSpinner = faSpinner;

  authenticated: boolean = false;
  loading: boolean = true;
  nightMode: UserSetting = null;
  sideBarOpen: boolean = false;

  ifModal: boolean = false;
  ifTools: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private sizeService: SizeService,
    private userSettingsService: UserSettingsService,
    private modalService: ModalService,
    private toolsService: ToolsService,
  ) { }

  @HostListener('window:resize', ['$event']) onResize(event) {
    let innerWidth = event.target.innerWidth;
    let innerHeight = event.target.innerHeight;
    this.sizeService.updateSize(innerWidth, innerHeight);
  }

  private appScreenSize: AppScreenSize;

  ngOnInit() {

    this.onScreenSizeChanged(this.sizeService.updateSize(window.innerWidth, window.innerHeight));
    this.sizeService.appScreenSize$.subscribe((appScreenSize: AppScreenSize)=>{
      this.onScreenSizeChanged(appScreenSize);
    })


    this.modalService.activeModal$.subscribe((modal: Modal) => {
      if (modal) {
        this.ifModal = true;
      } else {
        this.ifModal = false;
      }
    });

    this.toolsService.currentTool$.subscribe((tool: ToolComponents) => {
      if (tool != null) {
        this.ifTools = true;
      } else {
        this.ifTools = false;
      }
    })


    this.userSettingsService.userSettings$.subscribe((userSettings: UserSetting[]) => {
      for (let setting of userSettings) {
        if (setting.name == "night_mode") {
          this.nightMode = setting;
        }
      }
    });

    this.authService.authStatus$.subscribe(
      (authStatus: AuthStatus) => {
        if (authStatus.isAuthenticated) {
          this.loading = false;
          this.authenticated = true;
        } else {
          this.authenticated = false;
        }
      }
    )
    this.authService.checkLocalStorage$.subscribe((isPresent: boolean) => {
      if (isPresent) {

      } else {
        this.loading = false;
      }
    })
    this.authService.checkLocalStorage();


  }

  onScreenSizeChanged(appScreenSize: AppScreenSize){
    this.appScreenSize = appScreenSize;
    if(this.appScreenSize < 2){
      this.sideBarOpen = false;
    }else if(this.appScreenSize >= 2){
      if (localStorage.getItem("sidebar_is_open") == "true") {
        this.sideBarOpen = true;
      }
    }
  }

  onHeaderSidebarButtonClicked() {
    this.sideBarOpen = !this.sideBarOpen;
    localStorage.setItem("sidebar_is_open", this.sideBarOpen.toString());
  }


}
