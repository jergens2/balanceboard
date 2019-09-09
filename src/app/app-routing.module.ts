import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { HomeComponent } from "./dashboard/home/home.component";

import { NetWorthComponent } from "./dashboard/finance/net-worth/net-worth.component";
import { DaybookComponent } from "./dashboard/daybook/daybook.component";

import { UserSettingsComponent } from "./shared/document-definitions/user-account/user-settings/user-settings.component";

import { DayTemplatesComponent } from "./dashboard/scheduling/day-templates/day-templates.component";
import { NotebooksComponent } from "./dashboard/notebooks/notebooks.component";
import { TasksComponent } from "./dashboard/tasks/tasks.component";
import { SchedulingComponent } from "./dashboard/scheduling/scheduling.component";
import { ScheduleRotationsComponent } from "./dashboard/scheduling/schedule-rotations/schedule-rotations.component";
import { RecurringTasksComponent } from "./dashboard/scheduling/recurring-tasks/recurring-tasks.component";
import { SchedulePlannerComponent } from "./dashboard/scheduling/schedule-planner/schedule-planner.component";
import { ActivitiesComponent } from "./dashboard/activities/activities.component";
import { SocialComponent } from "./dashboard/social/social.component";
import { PointsComponent } from "./dashboard/points/points.component";


const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },

    { path: 'tasks', component: TasksComponent },

    { path: 'networth', component: NetWorthComponent },
    { path: 'daybook', component: DaybookComponent },
    { path: 'daybook/:isoDate', component: DaybookComponent },

    { path: 'social', component: SocialComponent }, 

    { path: 'notebooks', component: NotebooksComponent },

    { path: 'activities', component: ActivitiesComponent },
    { path: 'activities/:activityIdentifier', component: ActivitiesComponent },
    { path: 'user-settings', component: UserSettingsComponent },



    { path: 'scheduling', component: SchedulingComponent },
    { path: 'schedule-rotations', component: ScheduleRotationsComponent },
    { path: 'schedule-planner', component: SchedulePlannerComponent},
    { path: 'day-templates', component: DayTemplatesComponent },
    { path: 'recurring-tasks', component: RecurringTasksComponent },
    // { path: 'year', component: YearViewComponent },

    { path: 'points', component: PointsComponent },
    

    // { path: '**', component: PageNotFoundComponent }   
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