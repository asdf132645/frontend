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
            endpoint: 'wbc/getAllWbc',
            requiresToken: false,
        }
    },
    user:{
        register:{
            endpoint: 'user/register',
            requiresToken: false,
        },
        login:{
            endpoint:'user/login',
            requiresToken: false,
        },
        userCheck:{
            endpoint: 'user',
            requiresToken: false,
        }
    },
    settings:{
        cellImgAnalyzedPost:{
            cellImgAdd:{
                endpoint:'cellImgAnalyzed/cellImgAdd',
                requiresToken: false,
            },
            cellImgGetPut:{
                endpoint:'cellImgAnalyzed',
                requiresToken: false,
            }
        }
    }
};