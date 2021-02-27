import { Component, OnInit } from '@angular/core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor() { }

  public get faGithub() { return faGithub; }

  ngOnInit(): void {
  }

}
