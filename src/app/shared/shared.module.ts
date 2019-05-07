import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { YearViewComponent } from './year-view/year-view.component';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        YearViewComponent,
    ],
    exports: [
        CommonModule,
        YearViewComponent
    ]
})

export class SharedModule {}