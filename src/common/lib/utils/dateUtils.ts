import moment from 'moment';
import 'moment-timezone';


export function getDateTimeStr(): string {
    const now = moment();

    const formattedTime = now.format('YYYYMMDDHHmm');

    return formattedTime;
}

export const formatDateString = (dateString: any) => {
    if(!dateString){
       return null;
    }
    const momentObj = moment(dateString, 'YYYYMMDDHHmmssSSSSS');
    return momentObj.format('YYYY-MM-DD HH:mm:ss');
}

export const getCountToTime = (timeCount: number): string => {
    const hour = Math.floor(timeCount / 3600);
    const minutes = Math.floor((timeCount % 3600) / 60);
    const seconds = Math.floor((timeCount % 3600) % 60);

    return `${pad(hour, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
}

const pad = (value: number, length: number): string => {
    return String(value).padStart(length, '0');
}


export const parseDateString = (dateString: string): Date => {
    const year = +dateString.substring(0, 4);
    const month = +dateString.substring(4, 6) - 1;
    const day = +dateString.substring(6, 8);
    const hours = +dateString.substring(8, 10);
    const minutes = +dateString.substring(10, 12);
    const seconds = +dateString.substring(12, 14);

    return new Date(year, month, day, hours, minutes, seconds);
}

export const formatDate = (date: any) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};