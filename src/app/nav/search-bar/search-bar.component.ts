import { Component, OnInit } from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {

  faSearch = faSearch;

  constructor() { }

  ngOnInit() {
  }

  focus: boolean = false;

  onFocusInInput(){
    this.focus = true;
  }
  onFocusOutInput(){
    this.focus = false;
  }

}
