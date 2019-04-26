import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DayTemplate } from '../../day-templates/day-template.model';
import { IDayTemplateItem } from '../../day-templates/day-template-item.interface';
import { Modal } from '../../../../modal/modal.model';
import { Subscription } from 'rxjs';
import { ModalService } from '../../../../modal/modal.service';
import { DayTemplatesService } from '../../day-templates/day-templates.service';
import { IModalOption } from '../../../../modal/modal-option.interface';
import { Router } from '@angular/router';

import * as moment from 'moment';
import { ModalComponentType } from '../../../../modal/modal-component-type.enum';

@Component({
  selector: 'app-rotation-day-template',
  templateUrl: './rotation-day-template.component.html',
  styleUrls: ['./rotation-day-template.component.css']
})
export class RotationDayTemplateComponent implements OnInit, OnDestroy {

  private _dayTemplateItem: IDayTemplateItem = null;
  @Input() set dayTemplateItem(dayTemplateItem: IDayTemplateItem) {
    this._dayTemplateItem = Object.assign({}, dayTemplateItem);
    if(this._dayTemplateItem.dayTemplate){
      this.setDayTemplate();
      this.templateIsSpecified = true;
    }else{
      this.templateIsSpecified = false;
    }
  };

  get dayTemplateItem(): IDayTemplateItem{
    return this._dayTemplateItem;
  }

  templateIsSpecified: boolean = false;

  constructor(private modalService: ModalService, private dayTemplatesService: DayTemplatesService, private router: Router) { }

  private _modalSubscription: Subscription = new Subscription();
  private _dayTemplates: DayTemplate[] = [];

  dayTemplateStyle: any = {};

  ngOnInit() {
    this._dayTemplates = this.dayTemplatesService.dayTemplates;

  }

  private setDayTemplate(){

    let style: any = { 
      "background-color":"" + this._dayTemplateItem.dayTemplate.color, 
    };

    this.dayTemplateStyle = style;
    this._modalSubscription.unsubscribe();
  }

  ngOnDestroy(){
    this._modalSubscription.unsubscribe();
  }

  onClickSelectTemplate(){
    this._modalSubscription.unsubscribe();
    
    let modalOptions: IModalOption[] = [];
    for(let template of this._dayTemplates){
      modalOptions.push({
        value: template.name,
        dataObject: template
      })
    };
    modalOptions.push({
      value: "Create a new template",
      dataObject: null
    });

    let modalStyle: any = {
      "width":"600px"
    };

    let modal: Modal = new Modal("Select a template", null, modalOptions, modalStyle, ModalComponentType.Default);
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
      if (selectedOption.value == "Create a new template") {
        this.router.navigate(['/day-templates']);
      } else {
        for (let template of this._dayTemplates){
          if(selectedOption.value == template.name){

            this._dayTemplateItem.dayTemplate = template;

            this.setDayTemplate();
            this.templateIsSpecified = true;
          }
        }
      }
    });
    this.modalService.activeModal = modal;
  }

  get dayOfWeek(): string{ 
    return moment(this._dayTemplateItem.date).format('ddd')
  }

}
