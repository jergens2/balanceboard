import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirstTimeConfigComponent } from './first-time-config/first-time-config.component';
import { SharedModule } from '../../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';



@NgModule({
  declarations: [
    FirstTimeConfigComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FontAwesomeModule
  ],
  exports: [
    FirstTimeConfigComponent,
  ]
})
export class UserAccountProfileModule { }
