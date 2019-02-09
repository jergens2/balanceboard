import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { HomeComponent } from "./dashboard/home/home.component";
import { IvyleeCreationComponent } from "./dashboard/productivity/ivylee/ivylee-creation/ivylee-creation.component";
import { IvyleeManageComponent } from "./dashboard/productivity/ivylee/ivylee-manage/ivylee-manage.component";
import { BodyWeightComponent } from "./dashboard/health/body-weight/body-weight.component";
import { BuildProfileComponent } from "./dashboard/health/build-profile/build-profile.component";
import { NetWorthComponent } from "./dashboard/finance/net-worth/net-worth.component";
import { TimelogComponent } from "./dashboard/timelog/timelog.component";
import { ActivitiesComponent } from "./dashboard/activities/activities.component";
import { DaybookComponent } from "./dashboard/daybook/daybook.component";
import { MonthPlannerComponent } from "./dashboard/month-planner/month-planner.component";
import { YearPlannerComponent } from "./dashboard/year-planner/year-planner.component";
import { UserSettingsComponent } from "./user-settings/user-settings.component";

const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'ivyleeCreation', component: IvyleeCreationComponent },
    { path: 'ivyleeManagement', component: IvyleeManageComponent },
    { path: 'bodyWeight', component: BodyWeightComponent },
    { path: 'healthProfile', component: BuildProfileComponent },
    { path: 'networth', component: NetWorthComponent },
    { path: 'daybook', component: DaybookComponent },
    { path: 'daybook/:isoDate', component: DaybookComponent },
    { path: 'month_planner', component: MonthPlannerComponent },
    { path: 'year_planner', component: YearPlannerComponent },
    { path: 'timelog', component: TimelogComponent },
    { path: 'activities', component: ActivitiesComponent },
    { path: 'user_settings', component: UserSettingsComponent }
];


@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes),
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule { }