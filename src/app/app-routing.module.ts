import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { HomeComponent } from "./app-pages/home/home.component";

import { NetWorthComponent } from "./app-pages/finance/net-worth/net-worth.component";
import { DaybookComponent } from "./app-pages/daybook/daybook.component";


import { DayTemplatesComponent } from "./app-pages/scheduling/day-templates/day-templates.component";
import { NotesComponent } from "./app-pages/notes/notes.component";
import { TasksComponent } from "./app-pages/tasks/tasks.component";
import { SchedulingComponent } from "./app-pages/scheduling/scheduling.component";
import { ScheduleRotationsComponent } from "./app-pages/scheduling/schedule-rotations/schedule-rotations.component";
import { RecurringTasksComponent } from "./app-pages/scheduling/recurring-tasks/recurring-tasks.component";
import { SchedulePlannerComponent } from "./app-pages/scheduling/schedule-planner/schedule-planner.component";
import { ActivitiesComponent } from "./app-pages/activities/activities.component";
import { SocialComponent } from "./app-pages/social/social.component";
import { PointsComponent } from "./app-pages/points/points.component";
import { UserAccountProfileComponent } from "./app-pages/user-account-profile/user-account-profile.component";
import { AboutComponent } from "./app-pages/about/about.component";



const appRoutes: Routes = [
    { path: '', component: HomeComponent },

    { path: 'about', component: AboutComponent },
    { path: 'home', component: HomeComponent },
    { path: 'tasks', component: TasksComponent },
    { path: 'networth', component: NetWorthComponent },
    { path: 'daybook', component: DaybookComponent },
    { path: 'daybook/:isoDate', component: DaybookComponent },
    { path: 'social', component: SocialComponent }, 
    { path: 'notes', component: NotesComponent },
    { path: 'activities', component: ActivitiesComponent },
    { path: 'activities/:activityIdentifier', component: ActivitiesComponent },
    // { path: 'user-settings', component: UserSettingsComponent },
    { path: 'user-account', component: UserAccountProfileComponent },
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