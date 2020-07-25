import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ResponsiveMenuListItem } from './responsive-menu-list-item.class';
import { ResponsiveMenuList } from './responsive-menu-list.class';

@Component({
  selector: 'app-responsive-menu-list',
  templateUrl: './responsive-menu-list.component.html',
  styleUrls: ['./responsive-menu-list.component.css']
})
export class ResponsiveMenuListComponent implements OnInit {

  constructor() { }

  private _menu: ResponsiveMenuList;


  @Input() public set menu(menu: ResponsiveMenuList) { this._menu = menu; }
  public get menu(): ResponsiveMenuList { return this._menu; }
  public get items(): ResponsiveMenuListItem[] { return this.menu.listItems; }


  ngOnInit(): void {
  }

  public onSelectItem(item: ResponsiveMenuListItem){
    this.items.forEach(item => item.unselect());
    item.onSelected();
  }

}
