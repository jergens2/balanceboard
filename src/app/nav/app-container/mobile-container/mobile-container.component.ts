import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mobile-container',
  templateUrl: './mobile-container.component.html',
  styleUrls: ['./mobile-container.component.css']
})
export class MobileContainerComponent implements OnInit {

  private _showMobileMenu: boolean = true;

  public get showMobileMenu(): boolean { return this._showMobileMenu; }

  constructor() { }

  ngOnInit(): void {
  }

  onCloseMobileMenu(){
    this._showMobileMenu = false;
  }

}
