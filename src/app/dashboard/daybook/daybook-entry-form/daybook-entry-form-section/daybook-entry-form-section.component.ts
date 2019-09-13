import { Component, OnInit, Input } from '@angular/core';
import { DaybookEntryFormSection, DaybookEntryFormSectionType} from './daybook-entry-form-section.class';

import { DaybookEntryForm } from '../daybook-entry-form.class';
import { faCheck, faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-daybook-entry-form-section',
  templateUrl: './daybook-entry-form-section.component.html',
  styleUrls: ['./daybook-entry-form-section.component.css']
})
export class DaybookEntryFormSectionComponent implements OnInit {

  constructor() { }



  @Input() formSection: DaybookEntryFormSection;
  @Input() daybookEntryForm: DaybookEntryForm; 

  ngOnInit() {
  }


  faCheck = faCheck;
  faCaretRight = faCaretRight;
  faCaretDown = faCaretDown;

}
