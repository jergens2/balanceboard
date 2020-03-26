import { DaybookController } from "../daybook-controller.class";

export enum DaybookDisplayUpdateType{
    DEFAULT = 'DEFAULT',
    CLOCK = 'CLOCK',
    ZOOM = 'ZOOM',
    CALENDAR = 'CALENDAR',
    DATABASE_ACTION = 'DATABASE_ACTION'
}
export interface DaybookDisplayUpdate{
    type: DaybookDisplayUpdateType;
    controller: DaybookController
}