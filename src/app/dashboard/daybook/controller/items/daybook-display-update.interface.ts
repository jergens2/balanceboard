import { DaybookController } from "../daybook-controller.class";

export enum DaybookDisplayUpdateType{
    DEFAULT = 'DEFAULT',
    CLOCK = 'CLOCK',
    CLOCK_DATE_CHANGED = 'CLOCK_DATE_CHANGED',
    ZOOM = 'ZOOM',
    CALENDAR = 'CALENDAR',
    DATABASE_ACTION = 'DATABASE_ACTION',
    DRAW_TIMELOG_ENTRY = 'DRAW_TIMELOG_ENTRY',
    ACTIVITIES_CHANGED = 'ACTIVITIES_CHANGED',
}
export interface DaybookDisplayUpdate{
    type: DaybookDisplayUpdateType;
    controller: DaybookController
}