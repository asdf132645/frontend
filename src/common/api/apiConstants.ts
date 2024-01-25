export const apiConstants = {
    auth: {
        refresh: {
            endpoint: '/auth/refresh',
            requiresToken: false,
        },
    },
    processInfo: {
        list: {
            endpoint: 'proinfo/getAllProcessInfo',
            requiresToken: false,
        },
    },
};