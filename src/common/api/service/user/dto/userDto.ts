export interface CreateUser {
    userId: string;
    password: string;
    name: string;
    employeeNo: string;
    userType: string;
    subscriptionDate?: Date;
    latestDate?: Date;
}

export interface loginUser {
    userId: string;
    password: string;
}

export interface UserResponse {
    success: boolean;
    user?: User;
    users?: User[];
}

export interface User {
    id: number;
    userId: string;
    password: string;
    name: string;
    employeeNo: string;
    userType: string;
    subscriptionDate: string;
    latestDate: string;
    [key: string]:any;
}
