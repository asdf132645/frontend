export function getDateTimeStr(): string {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
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

export const getStoredUser = () => {
    const storedUserString = sessionStorage.getItem('user');
    return storedUserString ? JSON.parse(storedUserString) : {};
};

export const reqUserId = () => {
    return getStoredUser().userId || '';
};

export const getDefaultReqUserId = () => {
    return reqUserId() || '';
};


