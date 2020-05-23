export interface SleepProfileHTTPData{
        _id: string,
        userId: string,
        previousFallAsleepTime: string,
        previousWakeupTime: string,
        energyAtWakeup:  number,
        nextFallAsleepTime: string,
        nextWakeupTime: string,
}