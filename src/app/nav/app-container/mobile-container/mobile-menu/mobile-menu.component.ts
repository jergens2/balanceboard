import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { faLock, faPlus } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { DaybookDisplayService } from 'src/app/app-pages/daybook/daybook-display.service';
import { DaybookWidgetType } from 'src/app/app-pages/daybook/widgets/daybook-widget.class';
import { ToolboxService } from 'src/app/toolbox/toolbox.service';
import { appMenuItems } from '../../../app-menu-items';
import { MenuItemType } from '../../full-size-container/header/header-menu/menu-item-type.enum';
import { MenuItem } from '../../full-size-container/header/header-menu/menu-item.class';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.css']
})
export class MobileMenuComponent implements OnInit {

  private _menuItems: MenuItem[] = appMenuItems;
  public get menuItems(): MenuItem[] { return this._menuItems; }

  public get faLock() { return faLock; }
  
  @Output() close: EventEmitter<boolean> = new EventEmitter();

  constructor(private router: Router, private daybookService: DaybookDisplayService, private authService: AuthenticationService) { }

  ngOnInit(): void {
  }


  public onClickItem(menuItem: MenuItem){
    if(menuItem.isLogout){
      this.authService.logout();
    }else{
      this.router.navigate(['/' + menuItem.routerLink]);
      this.close.emit(true);
    }

  }
  public onClickNew(menuItem: MenuItem){
    this.router.navigate(['/' + menuItem.routerLink]);
    if(menuItem.itemType === MenuItemType.DAYBOOK){
      this.daybookService.setDaybookWidget(DaybookWidgetType.TIMELOG);
      this.router.navigate(['/daybook']);
      this.daybookService.onClickNowDelineator();
    }
    this.close.emit(true);
  }

  public onClickLock(){
    this.authService.lock();
  }

}
