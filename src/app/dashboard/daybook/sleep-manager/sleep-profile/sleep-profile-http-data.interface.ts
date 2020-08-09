export interface SleepProfileHTTPData{
        _id: string,
        userId: string,
        previousFallAsleepTime: string,
        previousFallAsleepUTCOffset: number,
        previousWakeupTime: string,
        previousWakeupUTCOffset: number,
        energyAtWakeup:  number,
        nextFallAsleepTime: string,
        nextFallAsleepUTCOffset: number,
        nextWakeupTime: string,
        nextWakeupUTCOffset: number,
}