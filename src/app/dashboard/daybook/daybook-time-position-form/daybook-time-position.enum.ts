
/**
 * This enum type is used for determining the status of the current position in the time
 * 
 * NORMAL is the case where user has already entered their wakeup time
 * AWAKE_FROM_PREV_DAY is the case where it's for example after midnight but user is still awake from previous day, and before the wakeup time.
 * NEW_DAY is the case where user is around or after the wakeup time and starting a new day
 * UNCLEAR is a case where it is kind of not easy to make an inference because it's an odd circumstance
 */
export enum DaybookTimePosition{
    NORMAL = 'NORMAL',
    AWAKE_FROM_PREV_DAY = 'AWAKE_FROM_PREV_DAY',
    NEW_DAY = 'NEW_DAY',
    UNCLEAR = 'UNCLEAR',
    APPROACHING_SLEEP = 'APPROACHING_SLEEP',
}

/**
 * further notes on UNCLEAR:
 * 
 * UNCLEAR is mostly used for the case where it's some time after midnight but before default wakeup time and there is no other data available 
 * (essentially:  a new user opens the app some time between midnight and 7:30am, when most people are normally sleeping, 
 * and has no information inputted in either the previous day or the current day).
 */