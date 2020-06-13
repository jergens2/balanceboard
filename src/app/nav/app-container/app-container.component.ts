import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToolboxService } from '../../toolbox-menu/toolbox.service';
import { Subscription } from 'rxjs';
import { ScreenSizes } from '../../shared/screen-size/screen-sizes-enum';
import { ScreenSizeService } from '../../shared/screen-size/screen-size.service';

@Component({
  selector: 'app-app-container',
  templateUrl: './app-container.component.html',
  styleUrls: ['./app-container.component.css']
})
export class AppContainerComponent implements OnInit, OnDestroy {

  constructor(private toolsService: ToolboxService, private sizeService:ScreenSizeService) { }

  private _sidebarIsOpen: boolean = true;
  private _showTools: boolean = false;
  private _appScreenSize: ScreenSizes;

  public get showTools(): boolean { return this._showTools; }
  public get appScreenSize(): ScreenSizes { return this._appScreenSize; }
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
      this.sizeService.appScreenSize$.subscribe((appScreenSize: ScreenSizes) => {
        this._onScreenSizeChanged(appScreenSize);
      }),
    ]
    this._onScreenSizeChanged(this.sizeService.updateSize(window.innerWidth, window.innerHeight));
  }

  
  onHeaderSidebarButtonClicked() {
    this._sidebarIsOpen = !this._sidebarIsOpen;
    // localStorage.setItem("sidebar_is_open", this._sidebarIsOpen.toString());
  }

  
  private _onScreenSizeChanged(appScreenSize: ScreenSizes) {
    this._appScreenSize = appScreenSize;
    if (this._appScreenSize < 2) {
      this._sidebarIsOpen = false;
    } else if (this._appScreenSize >= 2) {
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
