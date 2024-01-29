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
    rbcclassification: {
        list: {
            endpoint: 'rbc/getAllRbc',
            requiresToken: false,
        }
    },
    wbcclassification:{
        list: {
            endpoint: 'rbc/getAllWbc',
            requiresToken: false,
        }
    }
};