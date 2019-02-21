import { Component, OnInit, Input } from '@angular/core';
import { IHeaderMenu } from './header-menu.interface';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.css']
})
export class HeaderMenuComponent implements OnInit {

  constructor() { }

  @Input() openMenu: IHeaderMenu;

  ngOnInit() {
    
  }

}
