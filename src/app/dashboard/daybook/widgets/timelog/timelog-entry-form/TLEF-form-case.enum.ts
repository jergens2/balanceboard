

/**
 * These are pretty self explanatory but are specific to certain conditions.
 * 
 * NEW_CURRENT (aka NEW_CURRENT_PREVIOUS) means new TLE from previous availability (e.g. previous TLE.endTime) to now.  
 * 
 * NEW_CURRENT_FUTURE means new TLE from now to next unavailabilty.
 * 
 * NEW_PREVIOUS means new TLE but this entry takes place in the past (e.g. earlier in the day, or a previous day)
 * 
 * NEW_FUTURE means new TLE that takes place some time in the future.
 * 
 * EXISTING_FUTURE means a TLE that takes place in the future that already has been saved and exists,  
 * 
 * EXISTING_PREVIOUS means a TLE that takes place in the past, and has already been saved and exists
 * 
 * EXISTING_CURRENT means a TLE that was previously an EXISTING_FUTURE, but now that the clock has changed so it is EXISTING_CURRENT
 * 
 */
export enum TLEFFormCase{
    NEW_CURRENT = 'NEW_CURRENT',
    NEW_CURRENT_FUTURE = 'NEW_CURRENT_FUTURE',
    NEW_PREVIOUS = 'NEW_PREVIOUS',
    NEW_FUTURE = 'NEW_FUTURE',
    EXISTING_FUTURE = 'EXISTING_FUTURE',
    EXISTING_PREVIOUS = 'EXISTING_PREVIOUS',
    EXISTING_CURRENT = 'EXISTING_CURRENT',
    SLEEP = 'SLEEP',
}


