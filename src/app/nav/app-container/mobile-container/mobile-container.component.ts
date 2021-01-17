import { Component, OnInit } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { ToolboxService } from 'src/app/toolbox/toolbox.service';

@Component({
  selector: 'app-mobile-container',
  templateUrl: './mobile-container.component.html',
  styleUrls: ['./mobile-container.component.css']
})
export class MobileContainerComponent implements OnInit {

  private _showMobileMenu: boolean = true;
  private _showToolbox: boolean = false;

  public get faBars() { return faBars; }

  public get showMobileMenu(): boolean { return this._showMobileMenu; }
  public get showToolbox(): boolean { return this._showToolbox; }
  public get showRouterOutlet(): boolean { return this.showMobileMenu === false && this.showToolbox === false; }

  constructor(private toolService: ToolboxService) { }

  ngOnInit(): void {
    this.toolService.currentToolQueue$.subscribe((tools)=>{
      if(tools.length > 0){
        this._showMobileMenu = false;
        this._showToolbox = true;
      }else{
        this._showToolbox = false;
        this._showMobileMenu = true;
      }
    });
  }

  public onCloseMobileMenu(){
    this._showMobileMenu = false;
  }

  public onClickMenu(){
    this._showMobileMenu = true;
  }

}
