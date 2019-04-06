import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { HomeComponent } from "./dashboard/home/home.component";
import { IvyleeCreationComponent } from "./dashboard/productivity/ivylee/ivylee-creation/ivylee-creation.component";
import { IvyleeManageComponent } from "./dashboard/productivity/ivylee/ivylee-manage/ivylee-manage.component";
import { BodyWeightComponent } from "./dashboard/health/body-weight/body-weight.component";
import { BuildProfileComponent } from "./dashboard/health/build-profile/build-profile.component";
import { NetWorthComponent } from "./dashboard/finance/net-worth/net-worth.component";
import { ActivitiesComponent } from "./dashboard/activities/activities.component";
import { DaybookComponent } from "./dashboard/daybook/daybook.component";
import { MonthPlannerComponent } from "./dashboard/month-planner/month-planner.component";
import { YearPlannerComponent } from "./dashboard/year-planner/year-planner.component";
import { UserSettingsComponent } from "./user-settings/user-settings.component";
import { IdeaLogComponent } from "./dashboard/idea-log/idea-log.component";
import { ScheduleComponent } from "./dashboard/scheduling/schedule.component";
import { DayTemplatesComponent } from "./dashboard/scheduling/day-templates/day-templates.component";

const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'ivylee-creation', component: IvyleeCreationComponent },
    { path: 'ivylee-management', component: IvyleeManageComponent },
    { path: 'body-weight', component: BodyWeightComponent },
    { path: 'health-profile', component: BuildProfileComponent },
    { path: 'networth', component: NetWorthComponent },
    { path: 'daybook', component: DaybookComponent },
    { path: 'daybook/:isoDate', component: DaybookComponent },
    { path: 'month-planner', component: MonthPlannerComponent },
    { path: 'year-planner', component: YearPlannerComponent },
    { path: 'activities', component: ActivitiesComponent },
<<<<<<< HEAD
    { path: 'activities/:activityIdentifier', component: ActivitiesComponent },
    { path: 'idea_log', component: IdeaLogComponent },
    { path: 'user_settings', component: UserSettingsComponent },

    // { path: '**', component: PageNotFoundComponent }
=======
    { path: 'idea-log', component: IdeaLogComponent },
    { path: 'user-settings', component: UserSettingsComponent },
    { path: 'schedule', component: ScheduleComponent },
    { path: 'day-templates', component: DayTemplatesComponent}
>>>>>>> exporttimelog
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