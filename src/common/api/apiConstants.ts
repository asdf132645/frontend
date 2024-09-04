import {remainingCount} from "@/common/api/service/setting/settingApi";

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
        register: {
            endpoint: 'user/register',
            requiresToken: false,
        },
        login: {
            endpoint:'user/login',
            requiresToken: false,
        },
        logout: {
            endpoint: 'user/logout',
            requiresToken: false,
        },
        userCheck: {
            endpoint: 'user',
            requiresToken: false,
        },
        // userIp:{
        //     endpoint: 'ip',
        //     requiresToken: false,
        // },
        getUsers: {
            endpoint:'user/getUsers',
            requiresToken: false,
        },
        userDataPut: {
            endpoint:'user/update',
            requiresToken: false,
        },
        deleteUser: {
            endpoint: 'user/delete',
            requiresToken: false,
        }
    },
    settings: {
        cellImgAnalyzedPost: {
            cellImgAdd: {
                endpoint:'cellImgAnalyzed/cellImgAdd',
                requiresToken: false,
            },
            cellImgGet: {
                endpoint:'cellImgAnalyzed',
                requiresToken: false,
            },
            cellImgPut: {
                endpoint:'cellImgAnalyzed/update',
                requiresToken: false,
            }
        },
        rbcDegree: {
            rbcDegreeAdd: {
                endpoint: 'rbcDegree/rbcDegreeAdd',
                requiresToken: false,
            },
            rbcDegree: {
                endpoint: 'rbcDegree',
                requiresToken: false,
            }
        },
        wbcCustomClass: {
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
        lisCode: {
            create: {
                endpoint: 'lisCode/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'lisCode/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'lisCode/get',
                requiresToken: false,
            }
        },
        lisCodeRbc: {
            create: {
                endpoint: 'lisCodeRbc/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'lisCodeRbc/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'lisCodeRbc/get',
                requiresToken: false,
            }
        },
        cbcCode: {
            create: {
                endpoint: 'cbcCode/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'cbcCode/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'cbcCode/get',
                requiresToken: false,
            }
        },
        filePathSet: {
            create: {
                endpoint: 'filePathSet/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'filePathSet/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'filePathSet/get',
                requiresToken: false,
            }
        },
        runCount: {
            create: {
                endpoint: 'runCount/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'runCount/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'runCount/get',
                requiresToken: false,
            }
        },
        minCount: {
            create: {
                endpoint: 'minCount/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'minCount/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'minCount/get',
                requiresToken: false,
            }
        },
        runningInfo: {
            create: {
                endpoint: 'runningInfo/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'runningInfo/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'runningInfo/getAll',
                requiresToken: false,
            },
            delete:{
                endpoint: 'runningInfo/delete',
                requiresToken: false,
            },
            detail:{
                endpoint: 'runningInfo/detail',
                requiresToken: false,
            },
            classInfoDetail:{
                endpoint: 'runningInfo/classInfoDetail',
                requiresToken: false,
            },
            classInfoDetailSelectQuery:{
                endpoint: 'runningInfo/classInfoDetailSelectQuery',
                requiresToken: false,
            },
            classInfoMenuDetailSelectQuery:{
                endpoint: 'runningInfo/classInfoMenuDetailSelectQuery',
                requiresToken: false,
            },
            pageUpDown:{
                endpoint:'runningInfo/pageUpDown',
                requiresToken: false,
            },
            updatePcIpState:{
                endpoint:'runningInfo/updatePcIpState',
                requiresToken: false,
            },
            clearPcIpState:{
                endpoint:'runningInfo/clearPcIpState',
                requiresToken: false,
            },
            removePageAllData:{
                endpoint:'runningInfo/removePageAllData',
                requiresToken: false,
            }
        },
        folder: {
            get:{
                endpoint: 'folder/drives',
                requiresToken: false,
            }
        },
        folders: {
            get:{
                endpoint:'folders',
                requiresToken: false,
            }
        },
        classOrder: {
            create: {
                endpoint: 'classOrders/create',
                requiresToken: false,
            },
            update: {
                endpoint: 'classOrders/update',
                requiresToken: false,
            },
            get:{
                endpoint: 'classOrders/get',
                requiresToken: false,
            }
        },
        remainingCount: {
            get: {
                endpoint: 'remaining-count/execute',
                requiresToken: false,
            }
        },
        qualityCheck: {
            get: {
                endpoint: 'qualityCheck/execute',
                requiresToken: false,
            }
        }
    },
    images:{
        move: {
            endpoint: 'images/move',
            requiresToken: false,
        },
        moveClassImage: {
            endpoint: 'images/moveClassImage',
            requiresToken: false,
        }
    },
    jsonReader: {
        get: {
            endpoint: 'jsonReader/send',
            requiresToken: false,
        },
        jsonCreate: {
            endpoint: 'jsonReader/upload',
            requiresToken: false,
        }
    },
    dziReader: {
        get: {
            endpoint: 'dzi/send',
            requiresToken: false,
        }
    },
    pdf:{
        post:{
            endpoint: 'pdf/generate',
            requiresToken: false,
        }
    },
    filesystem:{
        post:{
            endpoint: 'filesystem/create-folder',
            requiresToken: false,
        },
        delete: {
            endpoint: 'filesystem/delete-folder',
            requiresToken: false,
        },
        readGetJpg:{
            endpoint: 'file/check-file-exists',
            requiresToken: false,
        },
        createDirectory: {
            endpoint: 'file/create-directory',
            requiresToken: false,
        },
        fileCreate:{
            endpoint: 'file/createFile',
            requiresToken: false,
        },
        cbcSaveData:{
            endpoint: 'file/cbcSaveData',
            requiresToken: false,
        }
    },
    fileTxtRead: {
        get:{
            endpoint: 'file/read',
            requiresToken: false,
        }
    },
    H7Read: {
        post: {
            endpoint: 'hl7/parse',
            requiresToken: false,
        }
    },
    H7Message:{
        post: {
            endpoint: 'hl7/message',
            requiresToken: false,
        }
    },
    Hl7Create:{
        post: {
            endpoint: 'hl7/hl7Create',
            requiresToken: false,
        }
    },
    device: {
        getDeviceInfo: {
            create: {
                endpoint: 'device/create',
                requiresToken: false,
            },
            get: {
                endpoint: 'device/get',
                requiresToken: false,
            },
            ip: {
                endpoint: 'ip',
                requiresToken: false,
            }
        }
    },
    download:{
        backUpDate: {
            endpoint: 'download/post',
            requiresToken: false,
        },
        checkIsPossibleToBackup: {
            endpoint: 'download/check',
            requiresToken: false,
        },
        openDrive: {
            endpoint: 'download/openDrive',
            requiresToken: false,
        }
    },
    upload: {
        restoreData: {
            endpoint: 'upload/execute',
            requiresToken: false,
        },
        checkDuplicated: {
            endpoint: 'upload/checkDuplicatedData',
            requiresToken: false,
        },
        checkPossibleUploadFile: {
            endpoint: 'upload/checkPossibleUploadFile',
            requiresToken: false,
        }
    },
    excel: {
        execute: {
            endpoint: 'excel/execute',
            requiresToken: false,
        }
    },
    browser:{
        exit:{
            endpoint: 'browser/close-edge',
            requiresToken: false,
        }
    },
    img:{
        checkImageExists: {
            endpoint: 'images/checkImageExists',
            requiresToken: false,
        }
    }
};