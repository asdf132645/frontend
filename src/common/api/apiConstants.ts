import {remainingCount} from "@/common/api/service/setting/settingApi";

export const apiConstants = {
    lisSend: {
        ywmcCbcCheck: {
            endpoint: 'sybase/cbc-results',
            requiresToken: false,
        },
        ywmcLisPostSend: {
            endpoint: 'sybase/save-uimd-result',
            requiresToken: false,
        },
        saveComment:{
            endpoint: 'sybase/saveComment',
            requiresToken: false,
        },
        cbcImgGet: {
            endpoint: 'sybase/cbcImgGet',
            requiresToken: false,
        },
    },
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
    wbcclassification: {
        list: {
            endpoint: 'wbc/getAllWbc',
            requiresToken: false,
        }
    },
    user: {
        register: {
            endpoint: 'user/register',
            requiresToken: false,
        },
        login: {
            endpoint: 'user/login',
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
            endpoint: 'user/getUsers',
            requiresToken: false,
        },
        userDataPut: {
            endpoint: 'user/update',
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
                endpoint: 'cellImgAnalyzed/cellImgAdd',
                requiresToken: false,
            },
            cellImgGet: {
                endpoint: 'cellImgAnalyzed',
                requiresToken: false,
            },
            cellImgGetById: {
                endpoint: 'cellImgAnalyzed/cellImgGetById',
                requiresToken: false,
            },
            cellImgPut: {
                endpoint: 'cellImgAnalyzed/update',
                requiresToken: false,
            },
            cellImgDelete: {
                endpoint: 'cellImgAnalyzed/delete',
                requiresToken: false,
            },
            cellImgGetAll: {
                endpoint: 'cellImgAnalyzed/getAll',
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
                endpoint: 'wbcCustomClass/wbcCustomClassCreate',
                requiresToken: false,
            },
            update: {
                endpoint: 'wbcCustomClass/wbcCustomClassUpdate',
                requiresToken: false,
            },
            get: {
                endpoint: 'wbcCustomClass/wbcCustomClassGet',
                requiresToken: false,
            }
        },
        wbcHotKeys: {
            create: {
                endpoint: 'wbcHotKeys/wbcHotKeysCreate',
                requiresToken: false,
            },
            update: {
                endpoint: 'wbcHotKeys/wbcHotKeysUpdate',
                requiresToken: false,
            },
            get: {
                endpoint: 'wbcHotKeys/wbcHotKeysGet',
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
            get: {
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
            get: {
                endpoint: 'normalRange/normalRangeGet',
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
            get: {
                endpoint: 'imagePrint/get',
                requiresToken: false,
            }
        },
        lisCode: {
            create: {
                endpoint: 'lisCode/lisCodeCreate',
                requiresToken: false,
            },
            update: {
                endpoint: 'lisCode/lisCodeUpdate',
                requiresToken: false,
            },
            get: {
                endpoint: 'lisCode/lisCodeGet',
                requiresToken: false,
            }
        },
        lisCodeRbc: {
            create: {
                endpoint: 'lisCodeRbc/lisCodeRbcCreate',
                requiresToken: false,
            },
            update: {
                endpoint: 'lisCodeRbc/lisCodeRbcUpdate',
                requiresToken: false,
            },
            get: {
                endpoint: 'lisCodeRbc/lisCodeRbcGet',
                requiresToken: false,
            }
        },
        cbcCode: {
            create: {
                endpoint: 'cbcCode/cbcCodeCreate',
                requiresToken: false,
            },
            update: {
                endpoint: 'cbcCode/cbcCodeUpdate',
                requiresToken: false,
            },
            get: {
                endpoint: 'cbcCode/cbcCodeGet',
                requiresToken: false,
            }
        },
        filePathSet: {
            create: {
                endpoint: 'filePathSet/filePathSetCreate',
                requiresToken: false,
            },
            update: {
                endpoint: 'filePathSet/filePathSetUpdate',
                requiresToken: false,
            },
            get: {
                endpoint: 'filePathSet/filePathSetGet',
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
            get: {
                endpoint: 'runCount/get',
                requiresToken: false,
            }
        },
        minCount: {
            create: {
                endpoint: 'minCount/minCountCreate',
                requiresToken: false,
            },
            update: {
                endpoint: 'minCount/minCountUpdate',
                requiresToken: false,
            },
            get: {
                endpoint: 'minCount/minCountGet',
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
            get: {
                endpoint: 'runningInfo/getAll',
                requiresToken: false,
            },
            delete: {
                endpoint: 'runningInfo/delete',
                requiresToken: false,
            },
            detail: {
                endpoint: 'runningInfo/detail',
                requiresToken: false,
            },
            classInfoDetail: {
                endpoint: 'runningInfo/classInfoDetail',
                requiresToken: false,
            },
            classInfoDetailSelectQuery: {
                endpoint: 'runningInfo/classInfoDetailSelectQuery',
                requiresToken: false,
            },
            classInfoMenuDetailSelectQuery: {
                endpoint: 'runningInfo/classInfoMenuDetailSelectQuery',
                requiresToken: false,
            },
            pageUpDown: {
                endpoint: 'runningInfo/pageUpDown',
                requiresToken: false,
            },
            updatePcIpState: {
                endpoint: 'runningInfo/updatePcIpState',
                requiresToken: false,
            },
            clearPcIpState: {
                endpoint: 'runningInfo/clearPcIpState',
                requiresToken: false,
            },
            removePageAllData: {
                endpoint: 'runningInfo/removePageAllData',
                requiresToken: false,
            }
        },
        folder: {
            get: {
                endpoint: 'folder/drives',
                requiresToken: false,
            }
        },
        folders: {
            get: {
                endpoint: 'folders',
                requiresToken: false,
            }
        },
        classOrder: {
            create: {
                endpoint: 'classOrders/classOrdersCreate',
                requiresToken: false,
            },
            update: {
                endpoint: 'classOrders/classOrdersUpdate',
                requiresToken: false,
            },
            get: {
                endpoint: 'classOrders/classOrdersGet',
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
        },
        crc: {
            crcSettingCreate: {
                endpoint: 'crc-setting',
                requiresToken: false,
            },
            crcGet: {
                endpoint: 'crc-setting/crc-get',
                requiresToken: false,
            },
            crcPut: {
                endpoint: 'crc-setting/crc-put',
                requiresToken: false,
            },
            crcDel: {
                endpoint: 'crc-setting/crcDel',
                requiresToken: false,
            }
        }
    },
    images: {
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
    pdf: {
        post: {
            endpoint: 'pdf/generate',
            requiresToken: false,
        }
    },
    filesystem: {
        post: {
            endpoint: 'filesystem/create-folder',
            requiresToken: false,
        },
        copy: {
            endpoint: 'filesystem/copy',
            requiresToken: false,
        },
        cleanup: {
            endpoint: 'filesystem/cleanup',
            requiresToken: false,
        },
        existsFile: {
            endpoint: 'filesystem/existsFile',
            requiresToken: false,
        },
        fileSearch:{
            endpoint:'filesystem/fileSearch',
            requiresToken: false,
        },
        delete: {
            endpoint: 'filesystem/delete-folder',
            requiresToken: false,
        },
        readGetJpg: {
            endpoint: 'file/check-file-exists',
            requiresToken: false,
        },
        createDirectory: {
            endpoint: 'file/create-directory',
            requiresToken: false,
        },
        fileCreate: {
            endpoint: 'file/createFile',
            requiresToken: false,
        },
        cbcSaveData: {
            endpoint: 'file/cbcSaveData',
            requiresToken: false,
        },
        errLogsRead:{
            endpoint: 'filesystem/errLogsRead',
            requiresToken: false,
        },
        readAllErrorLogs: {
            endpoint: 'filesystem/readAllErrorLogs',
            requiresToken: false,
        }
    },
    fileTxtRead: {
        get: {
            endpoint: 'file/read',
            requiresToken: false,
        },
        readFileEUCKR: {
            endpoint: 'file/readFileEUCKR',
            requiresToken: false,
        }
    },
    H7Read: {
        post: {
            endpoint: 'hl7/parse',
            requiresToken: false,
        }
    },
    H7Message: {
        post: {
            endpoint: 'hl7/message',
            requiresToken: false,
        },
        noFlagHl7: {
            endpoint: 'hl7/noFlagMessage',
            requiresToken: false,
        }
    },
    H7MessageCustom: {
        post: {
            endpoint: 'hl7/customMessage',
            requiresToken: false,
        }
    },
    Hl7Create: {
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
        },
        updateDeviceInfo: {
            endpoint: 'device/put',
            requiresToken: false,
        }
    },
    download: {
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
    browser: {
        exit: {
            endpoint: 'browser/close-edge',
            requiresToken: false,
        },
        nodeExit: {
            endpoint: 'browser/close-node',
            requiresToken: false,
        }
    },
    img: {
        checkImageExists: {
            endpoint: 'images/checkImageExists',
            requiresToken: false,
        }
    },
    report: {
        crcRemarkCreate: {
            endpoint: 'crc-remark-setting/crcRemarkCreate',
            requiresToken: false,
        },
        crcRemarkFindAll: {
            endpoint: 'crc-remark-setting/crcRemarkFindAll',
            requiresToken: false,
        },
        crcRemarkRemove: {
            endpoint: 'crc-remark-setting/crcRemarkRemove',
            requiresToken: false,
        },
        crcRemarkUpdate: {
            endpoint: 'crc-remark-setting/crcRemarkUpdate',
            requiresToken: false,
        },
        crcSearch: {
            endpoint: 'crc-remark-setting/crcRemark',
            requiresToken: false,
        },
        crcDataCreate: {
            endpoint: 'crc-data-setting/crcDataCreate',
            requiresToken: false,
        },
        crcDataFindAll: {
            endpoint: 'crc-data-setting/crcDataDFindAll',
            requiresToken: false,
        },
        crcDataRemove: {
            endpoint: 'crc-data-setting/crcDataRemove',
            requiresToken: false,
        },
        crcDataUpdate: {
            endpoint: 'crc-data-setting/crcDataUpdate',
            requiresToken: false,
        },
        crcOptionGet: {
            endpoint: 'crc-option/crcOptionGet',
            requiresToken: false,
        },
        crcOptionCreate: {
            endpoint: 'crc-option/crcOptionCreate',
            requiresToken: false,
        },
        crcOptionUpdate: {
            endpoint: 'crc-option/crcOptionUpdate',
            requiresToken: false,
        },
        crcRecoCreate: {
            endpoint: 'crc-recommendation-setting/crcRecommendationCreate',
            requiresToken: false,
        },
        crcRecoFindAll: {
            endpoint: 'crc-recommendation-setting/crcRecommendationFindAll',
            requiresToken: false,
        },
        crcRecoRemove: {
            endpoint: 'crc-recommendation-setting/crcRecommendationRemove',
            requiresToken: false,
        },
        crcRecoUpdate: {
            endpoint: 'crc-recommendation-setting/crcRecommendationUpdate',
            requiresToken: false,
        },
        crcRecoSearch: {
            endpoint: 'crc-recommendation-setting/crcRSearch',
            requiresToken: false,
        },
        crcCommentCreate: {
            endpoint: 'crc-comment-setting/crcCommentCreate',
            requiresToken: false,
        },
        crcCommentFindAll: {
            endpoint: 'crc-comment-setting/crcCommentFindAll',
            requiresToken: false,
        },
        crcCommentRemove: {
            endpoint: 'crc-comment-setting/crcCommentRemove',
            requiresToken: false,
        },
        crcCommentUpdate: {
            endpoint: 'crc-comment-setting/crcCommentUpdate',
            requiresToken: false,
        },
        crcCommentSearch: {
            endpoint: 'crc-comment-setting/crcCommentSearch',
            requiresToken: false,
        },
        saveDataCreate: {
            endpoint: 'crc-save-data/saveDataCreate',
            requiresToken: false,
        },
        saveDataSlotIdGet: {
            endpoint: 'crc-save-data/saveDataSlotIdGet',
            requiresToken: false,
        },
        saveDataPutData: {
            endpoint: 'crc-save-data/saveDataPutData',
            requiresToken: false,
        },
        saveDataDelete: {
            endpoint: 'crc-save-data/saveDataDelete',
            requiresToken: false,
        }

    }
};