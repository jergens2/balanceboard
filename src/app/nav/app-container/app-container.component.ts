import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToolboxService } from '../../toolbox/toolbox.service';
import { Subscription } from 'rxjs';
import { AppScreenSizeLabel } from '../../shared/app-screen-size/app-screen-size-label.enum';
import { AppScreenSizeService } from '../../shared/app-screen-size/app-screen-size.service';
import { AppScreenSize } from '../../shared/app-screen-size/app-screen-size.class';
import { UserActionPromptService } from '../user-action-prompt/user-action-prompt.service';
import { ModalService } from '../../modal/modal.service';
import { DaybookDisplayService } from '../../app-pages/daybook/daybook-display.service';
import { ActivityComponentService } from '../../app-pages/activities/activity-component.service';
import { ActivityHttpService } from '../../app-pages/activities/api/activity-http.service';
import { DaybookHttpService } from '../../app-pages/daybook/daybook-day-item/daybook-http.service';
import { NoteHttpService } from '../../app-pages/notes/api/note-http.service';
import { TaskHttpService } from '../../app-pages/tasks/task-http.service';
import { UserAccountProfileService } from '../../app-pages/user-account-profile/user-account-profile.service';
import { SleepService } from '../../app-pages/daybook/sleep-manager/sleep.service';
import { AsyncDataServiceLoader } from './async-data-service-loader.class';
import { AuthenticationService } from '../../authentication/authentication.service';
import { AppAsyncServiceList } from './async-data-service-list.interface';
import { Modal } from '../../modal/modal.class';
import { BackgroundImageService } from '../../shared/background-image.service';

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
    private bgService: BackgroundImageService,
  ) { }

  private _showTools: boolean = false;
  private _appScreenSize: AppScreenSize;


  private _subscriptions: Subscription[] = [];
  private _promptSub: Subscription = new Subscription();
  private _asyncDataLoader: AsyncDataServiceLoader;
  private _asyncSub: Subscription = new Subscription();
  private _isLoading: boolean = true;
  // private _loadingIsComplete: boolean = false;
  private _showModal: boolean = false;
  private _showUserActionPrompt: boolean = false;


  public get showTools(): boolean { return this._showTools; }
  public get appScreenSize(): AppScreenSize { return this._appScreenSize; }
  public get sizeLabel(): AppScreenSizeLabel { return this.appScreenSize.label; }


  public get isSmallSize(): boolean { return this.appScreenSize.isSmallSize; }
  public get isMediumSize(): boolean { return this.appScreenSize.isMediumSize; }
  public get isFullSize(): boolean { return this.appScreenSize.isFullSize; }

  public get isLoading(): boolean { return this._isLoading; }
  public get showUserActionPrompt(): boolean { return this._showUserActionPrompt && !this.isLoading; }
  public get showAppContainer(): boolean { return !this.isLoading && !this.showUserActionPrompt; }
  public get showModal(): boolean { return this._showModal; }

  public get backgroundNgClass(): string[] { return this.bgService.ngClass; }

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
    this._asyncSub = this._asyncDataLoader.loadingIsComplete$.subscribe(isComplete => {
      if (isComplete === true) { this._step3FinishSynchronousLoading(); }
    });
  }

  /** Refer to app-load-sequence.md */
  private _step3FinishSynchronousLoading() {
    console.log('3. **   Finish synchronously');
    // sleep service loads sleep manager
    this._asyncSub.unsubscribe();
    this._asyncDataLoader.finishLoading();
    this.sleepService.step3And5InitiateSleepManager();
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
      this._step5InitiateApp();
    }
  }

  /** Refer to app-load-sequence.md */
  private _step5InitiateApp() {
    console.log("5.** Initiating app")
    this._promptSub.unsubscribe();
    this._showUserActionPrompt = false;
    this.sleepService.step3And5InitiateSleepManager();
    this.daybookDisplayService.reinitiate();
    this._isLoading = false;
    console.log("5.** complete")
  }


  ngOnDestroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
    this._subscriptions = [];
    this._promptSub.unsubscribe();
    this.modalService.closeModal();
    this._isLoading = true;
    // this._loadingIsComplete = false;
    this._showModal = false;
    this._showUserActionPrompt = false;
    this._asyncDataLoader.unloadServices();
    this._asyncDataLoader = null;
    //this should probably be moved or delegated to the activity component.
    this.activityComponentService.unload();
    this.daybookDisplayService.logout();
    this.userPromptService.logout();
  }


  private _onScreenSizeChanged(appScreenSize: AppScreenSize) {this._appScreenSize = appScreenSize;}

}
