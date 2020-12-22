import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { DaybookDisplayService } from 'src/app/dashboard/daybook/daybook-display.service';
import { DaybookWidgetType } from 'src/app/dashboard/daybook/widgets/daybook-widget.class';
import { appMenuItems } from '../../../app-menu-items';
import { MenuItemType } from '../../../header/header-menu/menu-item-type.enum';
import { MenuItem } from '../../../header/header-menu/menu-item.class';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.css']
})
export class MobileMenuComponent implements OnInit {

  private _menuItems: MenuItem[] = appMenuItems;
  public get menuItems(): MenuItem[] { return this._menuItems; }
  
  @Output() close: EventEmitter<boolean> = new EventEmitter();

  constructor(private router: Router, private daybookService: DaybookDisplayService) { }

  ngOnInit(): void {
  }


  public onClickItem(menuItem: MenuItem){
    this.router.navigate(['/' + menuItem.routerLink]);
    this.close.emit(true);
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

}
