import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToolboxService } from '../../toolbox-menu/toolbox.service';
import { Subscription } from 'rxjs';
import { AppScreenSizeLabel } from '../../shared/app-screen-size/app-screen-size-label.enum';
import { AppScreenSizeService } from '../../shared/app-screen-size/app-screen-size.service';
import { AppScreenSize } from '../../shared/app-screen-size/app-screen-size.class';

@Component({
  selector: 'app-app-container',
  templateUrl: './app-container.component.html',
  styleUrls: ['./app-container.component.css']
})
export class AppContainerComponent implements OnInit, OnDestroy {

  constructor(private toolsService: ToolboxService, private sizeService:AppScreenSizeService) { }

  private _sidebarIsOpen: boolean = true;
  private _showTools: boolean = false;
  private _appScreenSize: AppScreenSize;

  public get showTools(): boolean { return this._showTools; }
  public get appScreenSize(): AppScreenSize { return this._appScreenSize; }
  public get sizeLabel(): AppScreenSizeLabel { return this.appScreenSize.label; }
  public get sidebarIsOpen(): boolean { return this._sidebarIsOpen; }

  private _subscriptions: Subscription[];

  ngOnInit(): void {
    this._subscriptions = [
      this.toolsService.currentToolQueue$.subscribe((queue) => {
        if (queue.length > 0) { this._showTools = true; }
      }),
      this.toolsService.onFormClosed$.subscribe((formClosed: boolean) => {
        if (formClosed === true) { this._showTools = false; }
      }),
      this.sizeService.appScreenSize$.subscribe((appScreenSize: AppScreenSize) => {
        this._onScreenSizeChanged(appScreenSize);
      }),
    ]
    this._onScreenSizeChanged(this.sizeService.appScreenSize);
  }

  
  onHeaderSidebarButtonClicked() {
    this._sidebarIsOpen = !this._sidebarIsOpen;
    // localStorage.setItem("sidebar_is_open", this._sidebarIsOpen.toString());
  }

  
  private _onScreenSizeChanged(appScreenSize: AppScreenSize) {
    this._appScreenSize = appScreenSize;
    if (this._appScreenSize.label < 2) {
      this._sidebarIsOpen = false;
    } else if (this._appScreenSize.label >= 2) {
      if (localStorage.getItem("sidebar_is_open") === "true") {
        this._sidebarIsOpen = true;
      }
    }
  }

  ngOnDestroy(){
    this._subscriptions.forEach(sub => sub.unsubscribe());
    this._subscriptions = null;
  }

}
