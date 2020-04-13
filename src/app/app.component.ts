import { Component, OnInit, HostListener } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthStatus } from './authentication/auth-status.class';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { UserSettingsService } from './shared/document-definitions/user-account/user-settings/user-settings.service';
import { UserSetting } from './shared/document-definitions/user-account/user-settings/user-setting.model';
import { ModalService } from './modal/modal.service';
import { Modal } from './modal/modal.class';
import { ToolboxService } from './toolbox-menu/toolbox.service';
import { ToolType } from './toolbox-menu/tool-type.enum';
import { ScreenSizeService } from './shared/screen-size/screen-size.service';
import { ScreenSizes } from './shared/screen-size/screen-sizes-enum';
import { OnScreenSizeChanged } from './shared/screen-size/on-screen-size-changed.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnScreenSizeChanged {

  faSpinner = faSpinner;

  private _authenticated: boolean = false;
  public get authenticated(): boolean {
    return this._authenticated;
  }
  loading: boolean = true;
  nightMode: UserSetting = null;
  sideBarOpen: boolean = true;

  private _showModal: boolean = false;
  private _showTools: boolean = false;

  public get showModal(): boolean { return this._showModal; }
  public get showTools(): boolean { return this._showTools; }

  constructor(
    private authService: AuthenticationService,
    private sizeService: ScreenSizeService,
    private userSettingsService: UserSettingsService,
    private modalService: ModalService,
    private toolsService: ToolboxService,
  ) { }

  @HostListener('window:resize', ['$event']) onResize(event) {
    let innerWidth = event.target.innerWidth;
    let innerHeight = event.target.innerHeight;
    this.sizeService.updateSize(innerWidth, innerHeight);
  }

  private appScreenSize: ScreenSizes;

  private authLoginSubscription: Subscription = new Subscription();
  private authLogoutSubscription: Subscription = new Subscription();

  ngOnInit() {
    this._authenticated = false;
    this.onScreenSizeChanged(this.sizeService.updateSize(window.innerWidth, window.innerHeight));
    this.sizeService.appScreenSize$.subscribe((appScreenSize: ScreenSizes) => {
      this.onScreenSizeChanged(appScreenSize);
    })


    this.modalService.activeModal$.subscribe((modal: Modal) => {
      if (modal) {
        this._showModal = true;
      } else {
        this._showModal = false;
      }
    });

    this.toolsService.currentToolQueue$.subscribe((queue)=>{
      if(queue.length > 0){
        this._showTools = true;
      }
    })
    this.toolsService.onFormClosed$.subscribe((formClosed: boolean) => {
      if (formClosed === true) {
        this._showTools = false;
      }
    });


    // this.userSettingsService.userSettings$.subscribe((userSettings: UserSetting[]) => {
    //   for (let setting of userSettings) {
    //     if (setting.name == "night_mode") {
    //       this.nightMode = setting;
    //     }
    //   }
    // });

    // this.authSubscription = this.authService.authStatus$.subscribe((authStatus: AuthStatus) => {
    //   console.log("Auth subscription: " , authStatus);
    //   if (authStatus) {
    //     if (authStatus.isAuthenticated) {
    //       this.loading = false;
    //       this.authenticated = true;
    //     }
    //   }
    // });

    this.authLoginSubscription = this.authService.appComponentLogin$.subscribe((onLogin)=>{
      if(onLogin === true){
        this._authenticated = true;
        this.loading = false;
      }
    })

    this.authLogoutSubscription = this.authService.logout$.subscribe((onLogout)=>{
      this.logout();
    })
    this.authService.checkLocalStorage$.subscribe((isPresent: boolean) => {
      if (isPresent) {
        this._authenticated = true;
      } else {
        this.loading = false;
        this._authenticated = false;
      }
    });
    this.authService.checkLocalStorage();


  }

  onScreenSizeChanged(appScreenSize: ScreenSizes) {
    this.appScreenSize = appScreenSize;
    if (this.appScreenSize < 2) {
      this.sideBarOpen = false;
    } else if (this.appScreenSize >= 2) {
      if (localStorage.getItem("sidebar_is_open") == "true") {
        this.sideBarOpen = true;
      }
    }
  }

  onHeaderSidebarButtonClicked() {
    this.sideBarOpen = !this.sideBarOpen;
    localStorage.setItem("sidebar_is_open", this.sideBarOpen.toString());
  }

  private logout() {
    console.log("logging out of app component.");
    this._authenticated = false;
    // this.authSubscription.unsubscribe();
    // this.authLogoutSubscription.unsubscribe();
  }


}
