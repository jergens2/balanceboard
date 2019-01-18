import { TimeSegment } from "../time-segment.model";

export interface ITimeSegmentTile {
    timeSegment: TimeSegment,
    style: Object,
    deleteButtonIsVisible: boolean
    ifUpdateTimeSegment: boolean;
}