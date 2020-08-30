import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToolboxService } from '../../toolbox-menu/toolbox.service';
import { Subscription } from 'rxjs';
import { AppScreenSizeLabel } from '../../shared/app-screen-size/app-screen-size-label.enum';
import { AppScreenSizeService } from '../../shared/app-screen-size/app-screen-size.service';
import { AppScreenSize } from '../../shared/app-screen-size/app-screen-size.class';
import { UserActionPromptService } from '../user-action-prompt/user-action-prompt.service';
import { ModalService } from '../../modal/modal.service';
import { DaybookDisplayService } from '../../dashboard/daybook/daybook-display.service';
import { ActivityComponentService } from '../../dashboard/activities/activity-component.service';
import { ActivityHttpService } from '../../dashboard/activities/api/activity-http.service';
import { DaybookHttpService } from '../../dashboard/daybook/api/daybook-http.service';
import { NoteHttpService } from '../../dashboard/notes/api/note-http.service';
import { TaskHttpService } from '../../dashboard/tasks/task-http.service';
import { UserAccountProfileService } from '../../dashboard/user-account-profile/user-account-profile.service';
import { SleepService } from '../../dashboard/daybook/sleep-manager/sleep.service';
import { AsyncDataServiceLoader } from './async-data-service-loader.class';
import { AuthenticationService } from '../../authentication/authentication.service';
import { AppAsyncServiceList } from './async-data-service-list.interface';
import { Modal } from '../../modal/modal.class';

@Component({
  selector: 'app-app-container',
  templateUrl: './app-container.component.html',
  styleUrls: ['./app-container.component.css']
})
export class AppContainerComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthenticationService,
    private toolsService: ToolboxService,
    private sizeService: AppScreenSizeService,
    private userPromptService: UserActionPromptService,
    private modalService: ModalService,
    private daybookDisplayService: DaybookDisplayService,
    private activityComponentService: ActivityComponentService,
    private activityHttpService: ActivityHttpService,
    private daybookHttpService: DaybookHttpService,
    private noteHttpService: NoteHttpService,
    private taskHttpService: TaskHttpService,
    private userProfileService: UserAccountProfileService,
    private sleepService: SleepService,
  ) { }

  private _sidebarIsOpen: boolean = true;
  private _showTools: boolean = false;
  private _appScreenSize: AppScreenSize;


  private _subscriptions: Subscription[] = [];
  private _promptSub: Subscription = new Subscription();
  private _asyncDataLoader: AsyncDataServiceLoader;
  private _isLoading: boolean = true;
  // private _loadingIsComplete: boolean = false;
  private _showModal: boolean = false;
  private _showUserActionPrompt: boolean = false;


  public get showTools(): boolean { return this._showTools; }
  public get appScreenSize(): AppScreenSize { return this._appScreenSize; }
  public get sizeLabel(): AppScreenSizeLabel { return this.appScreenSize.label; }
  public get sidebarIsOpen(): boolean { return this._sidebarIsOpen; }


  public get isLoading(): boolean { return this._isLoading; }
  public get showUserActionPrompt(): boolean { return this._showUserActionPrompt && !this.isLoading; }
  public get showAppContainer(): boolean { return !this.isLoading && !this.showUserActionPrompt; }
  public get showModal(): boolean { return this._showModal; }

  public get appContainerNgClass(): string[] {
    if (this.sizeLabel === 0) {
      return ['app-container-mobile'];
    } else if (this.sizeLabel === 1) {
      return ['app-container-tablet'];
    } else if (this.sizeLabel === 2) {
      return ['app-container-normal'];
    } else if (this.sizeLabel === 3 || this.sizeLabel === 4) {
      return ['app-container-large'];
    }
  }


  ngOnInit(): void {
    this._subscriptions = [
      this.toolsService.currentToolQueue$.subscribe((queue) => { if (queue.length > 0) { this._showTools = true; } }),
      this.toolsService.onFormClosed$.subscribe((formClosed: boolean) => { if (formClosed === true) { this._showTools = false; } }),
      this.sizeService.appScreenSize$.subscribe((appScreenSize: AppScreenSize) => { this._onScreenSizeChanged(appScreenSize); }),
      this.modalService.activeModal$.subscribe((modal: Modal) => { this._showModal = !(modal === null); }),
    ];
    this._onScreenSizeChanged(this.sizeService.appScreenSize);
    this._step2LoadAsyncData();
    // _loadAsyncData() data method calls _finishLoadingApp()
  }



  /** Refer to app-load-sequence.md */
  private _step2LoadAsyncData() {
    console.log('2. **   Loading async data');
    const serviceList: AppAsyncServiceList = {
      noteService: this.noteHttpService,
      activityService: this.activityHttpService,
      daybookService: this.daybookHttpService,
      taskService: this.taskHttpService,
      sleepService: this.sleepService,
      userProfileService: this.userProfileService,
    };
    this._asyncDataLoader = new AsyncDataServiceLoader(this.authService.userId, serviceList);
    this._asyncDataLoader.loadingIsComplete$.subscribe(isComplete => {
      if (isComplete === true) { this._step3FinishSynchronousLoading(); }
    });
  }

  /** Refer to app-load-sequence.md */
  private _step3FinishSynchronousLoading() {
    // sleep service loads sleep manager
    this.sleepService.step3InitiateSleepManager();
    this._step4CheckForPrompts();
  }

  /** Refer to app-load-sequence.md */
  private _step4CheckForPrompts() {
    console.log('4. **   Checking for prompts');
    const hasPrompts: boolean = this.userPromptService.initiate();
    if (hasPrompts) {
      this._showUserActionPrompt = true;
      this._isLoading = false;
      this._promptSub = this.userPromptService.promptsCleared$.subscribe(clear => this._step5InitiateApp());
    } else {
      this._showUserActionPrompt = false;
      this._step5InitiateApp();
    }
  }

  /** Refer to app-load-sequence.md */
  private _step5InitiateApp() {
    this._promptSub.unsubscribe();
    this.daybookDisplayService.reinitiate();
    this._isLoading = false;
  }


  ngOnDestroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
    this._subscriptions = [];
    this.modalService.closeModal();
    this._isLoading = true;
    // this._loadingIsComplete = false;
    this._showModal = false;
    this._showUserActionPrompt = false;
    this._asyncDataLoader.unloadServices();
    //this should probably be moved or delegated to the activity component.
    this.activityComponentService.unload();
    this.userPromptService.logout();
  }

  public onHeaderSidebarButtonClicked() {
    this._sidebarIsOpen = !this._sidebarIsOpen;
    // localStorage.setItem("sidebar_is_open", this._sidebarIsOpen.toString());
  }

  private _onScreenSizeChanged(appScreenSize: AppScreenSize) {
    this._appScreenSize = appScreenSize;
    if (this._appScreenSize.label < 2) {
      this._sidebarIsOpen = false;
    } else if (this._appScreenSize.label >= 2) {
      if (localStorage.getItem('sidebar_is_open') === 'true') {
        this._sidebarIsOpen = true;
      }
    }
  }

}
