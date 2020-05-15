import { Component, OnInit, HostListener } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';
import { ModalService } from './modal/modal.service';
import { Modal } from './modal/modal.class';
import { ToolboxService } from './toolbox-menu/toolbox.service';
import { ScreenSizeService } from './shared/screen-size/screen-size.service';
import { ScreenSizes } from './shared/screen-size/screen-sizes-enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  

  // nightMode: UserSetting = null;
  sideBarOpen: boolean = true;

  private _showModal: boolean = false;
  private _showTools: boolean = false;
  private _allSubs: Subscription[] = [];
  private _appScreenSize: ScreenSizes;

  public get showModal(): boolean { return this._showModal; }
  public get showTools(): boolean { return this._showTools; }
  public get isAuthenticated(): boolean { return this.authService.isAuthenticated; }

  constructor(
    private authService: AuthenticationService,
    private sizeService: ScreenSizeService,
    // private userSettingsService: UserSettingsService,
    private modalService: ModalService,
    private toolsService: ToolboxService,
  ) { }

  @HostListener('window:resize', ['$event']) onResize(event) {
    let innerWidth = event.target.innerWidth;
    let innerHeight = event.target.innerHeight;
    this.sizeService.updateSize(innerWidth, innerHeight);
  }


  ngOnInit() {
    this._reload();
  }

  private _reload(){
    this._onScreenSizeChanged(this.sizeService.updateSize(window.innerWidth, window.innerHeight));
    this._setSubscriptions();
  }

  private _onScreenSizeChanged(appScreenSize: ScreenSizes) {
    this._appScreenSize = appScreenSize;
    if (this._appScreenSize < 2) {
      this.sideBarOpen = false;
    } else if (this._appScreenSize >= 2) {
      if (localStorage.getItem("sidebar_is_open") == "true") {
        this.sideBarOpen = true;
      }
    }
  }

  onHeaderSidebarButtonClicked() {
    this.sideBarOpen = !this.sideBarOpen;
    localStorage.setItem("sidebar_is_open", this.sideBarOpen.toString());
  }


  private _setSubscriptions(){
    this._allSubs.forEach(sub => sub.unsubscribe());
    this._allSubs = [
      this.sizeService.appScreenSize$.subscribe((appScreenSize: ScreenSizes) => {
        this._onScreenSizeChanged(appScreenSize);
      }),
      this.modalService.activeModal$.subscribe((modal: Modal) => {
        if (modal) {
          this._showModal = true;
        } else {
          this._showModal = false;
        }
      }),
      this.toolsService.currentToolQueue$.subscribe((queue)=>{
        if(queue.length > 0){
          this._showTools = true;
        }
      }),
      this.toolsService.onFormClosed$.subscribe((formClosed: boolean) => {
        if (formClosed === true) {
          this._showTools = false;
        }
      }),
      this.authService.logout$.subscribe((onLogout)=>{
        this._reload();
      }),
    
    ];
  }


}
