
export interface Delineation{
    name: string,
    startAt: {hour: number, minute: number, second: number},
    endAt: { hour: number, minute: number, second: number},

    // all Delineations will utilize property startAt, but endAt is optional.  
    // if endAt is not present, then it is assumed to be a strict delineation at precisely the startAt time.  otherwise it is a range, from startAt to endAt
}