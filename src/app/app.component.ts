import { Component, OnInit, HostListener } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';
import { ModalService } from './modal/modal.service';
import { Modal } from './modal/modal.class';
import { ToolboxService } from './toolbox-menu/toolbox.service';
import { ScreenSizeService } from './shared/screen-size/screen-size.service';
import { ScreenSizes } from './shared/screen-size/screen-sizes-enum';
import { Subscription, Observable, Subject } from 'rxjs';
import { ActivityCategoryDefinitionService } from './dashboard/activities/api/activity-category-definition.service';
import { DaybookHttpRequestService } from './dashboard/daybook/api/daybook-http-request.service';
import { DaybookControllerService } from './dashboard/daybook/controller/daybook-controller.service';
import { UserActionPromptService } from './user-action-prompt/user-action-prompt.service';
import { NotebooksService } from './dashboard/notebooks/notebooks.service';

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
  private _showUserActionPrompt: boolean = false;
  private _allSubs: Subscription[] = [];
  private _appScreenSize: ScreenSizes;
  private _loading: boolean = true;
  private _isAuthenticated: boolean = false;
  /**
   * _loadingIsComplete
   * this variable checks to see if the app has already successfully completed the loading procedure.
   * It is necessary because the refreshToken operation in the auth service will trigger the appComponentLogin$ to fire TRUE,
   * but we don't want to reload the application when we update the token, 
   * so, if _loadingIsComplete === true, then we do not reload the application.
   */
  private _loadingIsComplete: boolean = false;

  public get showModal(): boolean { return this._showModal; }
  public get showTools(): boolean { return this._showTools; }
  public get isAuthenticated(): boolean { return this._isAuthenticated; }
  public get showUserActionPrompt(): boolean { return this._showUserActionPrompt; }
  public get loading(): boolean { return this._loading; }
  public get showAppContainer(): boolean { return this.isAuthenticated && !this.loading && !this.showUserActionPrompt; }
  public get appScreenSize(): ScreenSizes { return this._appScreenSize; }

  
  constructor(
    private authService: AuthenticationService,
    private sizeService: ScreenSizeService,
    private userPromptService: UserActionPromptService,
    // private userSettingsService: UserSettingsService,
    private modalService: ModalService,
    private toolsService: ToolboxService,

    private activitiesService: ActivityCategoryDefinitionService,
    private daybookHttpService: DaybookHttpRequestService,
    private daybookControllerService: DaybookControllerService,
    private notebookService: NotebooksService,
  ) { }

  @HostListener('window:resize', ['$event']) onResize(event) {
    let innerWidth = event.target.innerWidth;
    let innerHeight = event.target.innerHeight;
    this.sizeService.updateSize(innerWidth, innerHeight);
  }


  ngOnInit() {
    // console.log("APP COMPONENT NG ON INIT")
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
      if (localStorage.getItem("sidebar_is_open") === "true") {
        this.sideBarOpen = true;
      }
    }
  }

  onHeaderSidebarButtonClicked() {
    this.sideBarOpen = !this.sideBarOpen;
    localStorage.setItem("sidebar_is_open", this.sideBarOpen.toString());
  }


  private _setSubscriptions(){
    // console.log("Subscribing to subscriptions");
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
        this._unloadApp();
      }),
      this.authService.appComponentLogin$.subscribe((login: boolean)=>{
        // console.log("Boom Canon: ", login)
        if(login === true){
          this._isAuthenticated = true;
          if(!this._loadingIsComplete){
            this._loadApp();
          }
        }else{
          this._isAuthenticated = false;
          // console.log("appComponentLogin is FALSE, but NOT unloading the app.")
        }
        
      }),
      this.userPromptService.promptsCleared$.subscribe((clear)=>{
        if(clear === true){
          this._showUserActionPrompt = false;
          
        }else{
          console.log("error with user prompts.")
        }
      })
    ];
  }

  private _unloadApp(){
    // console.log("  _unloading app...")
    this._allSubs.forEach(sub => sub.unsubscribe());
    this._loadingSubs.forEach(sub => sub.unsubscribe());
    this.modalService.closeModal();
    this._isAuthenticated = false;
    this._loading = true;
    this._loadingIsComplete = false;
    
    this._loadingSubs = [];

    this._allSubs = [];
    this._showModal = false;
    
    this._allSubs = [];
    this._unloadServices();
    this._reload();
  }


  private _loadApp(){
    // console.log("Loading app in app component");
    this._loading = true;
    this._loadServices$().subscribe((result)=>{
      if(result === true){
        this._loading = false;
        this._loadingIsComplete = true;
        this._userActionPrompt(); 
        this._loadingSubs.forEach(s => s.unsubscribe());
        this._loadingSubs = [];
      }else{
        console.log("Error loading services.");
      }
    });
    
  }

  private _userActionPrompt(){
    let showUserActionPrompt = false;
    if(this.userPromptService.hasPrompts()){
      showUserActionPrompt = true;
    }
    this._showUserActionPrompt = showUserActionPrompt;
  }

  private _loadingSubs: Subscription[] = [];
  private _loadServices$(): Observable<boolean>{
    const _loadingComplete$:Subject<boolean> = new Subject();
    const userId: string = this.authService.userId;
    if(userId){
      this.notebookService.setUserId(userId);
      let daybookSub: Subscription;
      const activitySub: Subscription = this.activitiesService.login$(userId).subscribe((result)=>{
        if(result === true){
          this.daybookHttpService.login(userId);
          daybookSub = this.daybookControllerService.login$(userId).subscribe((result)=>{
            if(result === true){
              // console.log("Successfully logged in to all services");
              this._loadingSubs = [ activitySub, daybookSub ];
              _loadingComplete$.next(true);
            }else{
              console.log("Error loading daybookController Service")
              this._loadingSubs = [ activitySub, daybookSub ];
              _loadingComplete$.next(false);
            }
          })
        }else{
          console.log("Error loading activities");
          _loadingComplete$.next(false);
        }
      })
      
    }else{
      console.log("There is an issue with authentication.")
      _loadingComplete$.next(false);
    }
   return _loadingComplete$.asObservable(); 
  }

  private _unloadServices(){
    // console.log("Unloading services")
    this.activitiesService.logout();
    this.daybookHttpService.logout();
    this.daybookControllerService.logout();

    this.notebookService.setUserId('');
  }
}
