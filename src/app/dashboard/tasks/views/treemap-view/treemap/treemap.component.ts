import { Component, OnInit, Input } from '@angular/core';
import { TreeMap } from './treemap.class';

@Component({
  selector: 'app-treemap',
  templateUrl: './treemap.component.html',
  styleUrls: ['./treemap.component.css']
})
export class TreemapComponent implements OnInit {

  constructor() { }


  @Input() treeMap: TreeMap;

  ngOnInit() {
    console.log("treemap:", this.treeMap);
  }



}
