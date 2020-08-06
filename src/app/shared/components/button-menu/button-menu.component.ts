import { Component, OnInit, Input } from '@angular/core';
import { ButtonMenu } from './button-menu.class';
import { ButtonMenuItem } from './button-menu-item.class';

@Component({
  selector: 'app-button-menu',
  templateUrl: './button-menu.component.html',
  styleUrls: ['./button-menu.component.css']
})
export class ButtonMenuComponent implements OnInit {

  constructor() { }

  private _menu: ButtonMenu = new ButtonMenu();

  @Input() public set menu(menu: ButtonMenu) { this._menu = menu; }

  public get menu(): ButtonMenu { return this._menu; }
  public get menuItems(): ButtonMenuItem[] { return this._menu.menuItems; }
  public get modeIsSeparated(): boolean { return this._menu.modeIsSeparated; }
  public get modeIsMerged(): boolean { return this._menu.modeIsMerged; }


  ngOnInit(): void {
  }

  public onClickItem(itemClicked: ButtonMenuItem){
    this.menu.openItemClicked(itemClicked);
  }

}
