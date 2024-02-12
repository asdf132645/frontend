export interface CreateUser {
    userId: string;
    password: string;
    name: string;
    employeeNo: string;
    userType: string;
    subscriptionDate?: Date;
    latestDate?: Date;
    state?: string;
}

export interface loginUser {
    userId: string;
    password: string;
}