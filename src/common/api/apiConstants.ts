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
        },
        rbcDegree:{
            rbcDegreeAdd: {
                endpoint: 'rbcDegree/rbcDegreeAdd',
                requiresToken: false,
            },
            rbcDegree:{
                endpoint: 'rbcDegree',
                requiresToken: false,
            }
        },
        wbcCustomClass:{
            create: {
                endpoint: 'wbcCustomClass/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'wbcCustomClass/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'wbcCustomClass/get',
                requiresToken: false,
            }
        },
        wbcHotKeys: {
            create: {
                endpoint: 'wbcHotKeys/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'wbcHotKeys/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'wbcHotKeys/get',
                requiresToken: false,
            }
        },
        bfHotKeys: {
            create: {
                endpoint: 'bfHotKeys/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'bfHotKeys/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'bfHotKeys/get',
                requiresToken: false,
            }
        },
        normalRange: {
            create: {
                endpoint: 'normalRange/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'normalRange/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'normalRange/get',
                requiresToken: false,
            }
        },
        imagePrint: {
            create: {
                endpoint: 'imagePrint/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'imagePrint/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'imagePrint/get',
                requiresToken: false,
            }
        },
    }
};