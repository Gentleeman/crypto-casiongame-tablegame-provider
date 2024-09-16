import * as moment from 'moment-timezone';

export const getSessionTime = () => {
    const time = new Date(new Date().valueOf() + parseInt(process.env.SESSION as string));
    return moment.tz(time, process.env.TIME_ZONE as string);
};