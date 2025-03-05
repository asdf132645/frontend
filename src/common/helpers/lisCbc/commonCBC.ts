import {
    createCbcFile,
    fileSearchApi,
    fileSysClean,
    fileSysCopy,
    fileSysExistsFile
} from "@/common/api/service/fileSys/fileSysApi";
import {readFileTxt, readH7File} from "@/common/api/service/fileReader/fileReaderApi";
import {CbcCodeItem} from "@/common/api/service/setting/dto/lisCodeDto";
import axios from "axios";

interface CommonCBCType {
    cbcFilePath: string;
    barcodeNo: string;
    userId: string;
    deviceSerialNm: string;
    cbcCodeList: CbcCodeItem[];
    cbcFileName: string;
    slotId: string;
    imgDriveRootPath: string;
}

interface CommonFileDataType {
    cbcFileName: string;
    imgDriveRootPath: string;
    cbcFilePath: string;
    slotId: string;
    barcodeNo: string;
    cbcCodeList: CbcCodeItem[];
}

export const commonGetCBC = async ({ cbcFileName, cbcFilePath, barcodeNo, userId, deviceSerialNm, cbcCodeList, slotId, imgDriveRootPath } : CommonCBCType) => {
    let cbcWorkList: { classNm: string; count: string; unit: string }[] = [];
    let [cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, hosName] = ['', '', '', '', ''];
    let loading = false;
    console.log(1);

    // HTTP 통신 방식
    if (cbcFilePath.includes('http')) {
        const httpParams = {
            url: cbcFilePath,
            barcodeNo: barcodeNo,
            userId: userId,
            deviceBarcode: deviceSerialNm,
        };

        const url = httpParams.url + '?' +
            'barcodeNo=' + httpParams.barcodeNo + '&' +
            'deviceBarcode=' + deviceSerialNm + '&' +
            'userid=' + httpParams.userId ;

        await axios.get(url).then(async function (result) {
            const msg: any = await readH7File(result.data);
            msg.data?.segments.forEach(function (cbcSegment: any) {
                if (cbcSegment.name.trim() === 'OBX') {
                    cbcCodeList.forEach(function (cbcCode: any) {
                        if (cbcCode.classCd === cbcSegment.fields[3].value[0][0].value[0]) {
                            const obj = {
                                classNm: cbcCode.cd,
                                count: cbcSegment.fields[5].value[0][0].value[0],
                                unit: cbcSegment.fields[6].value[0][0].value[0]
                            }
                            cbcWorkList.push(obj)
                        }
                    })

                } else if (cbcSegment.name.trim() === 'PID') {
                    cbcPatientNo = cbcSegment.fields[1].value[0][0].value[0]
                    cbcPatientNm = cbcSegment.fields[4].value[0][0].value[0]
                    cbcSex = cbcSegment.fields[6].value[0][0].value[0]
                    cbcAge = cbcSegment.fields[7].value[0][0].value[0];
                }
            })
            loading = false;
        }).catch(function (err) {
            console.error(err.message)
            loading = false;
        })
    } else {  // 파일 방식
        const {
            cbcPatientNo: localCbcPatientNo,
            cbcPatientNm: localCbcPatientNm,
            cbcSex: localCbcSex,
            cbcAge: localCbcAge,
            cbcWorkList: localCbcWorkList,
            hosName: localHosName,
            loading: localLoading
        } = await commonFileData({ cbcCodeList, barcodeNo, slotId, imgDriveRootPath, cbcFilePath, cbcFileName });
        cbcPatientNo = localCbcPatientNo;
        cbcPatientNm = localCbcPatientNm;
        cbcSex = localCbcSex;
        cbcAge = localCbcAge;
        cbcWorkList = localCbcWorkList;
        hosName = localHosName;
        loading = localLoading;
    }

    const params = {
        filePath: `D:\\UIMD_Data\\UI_Log\\CBC_IA\\${barcodeNo}.txt`,
        data: cbcWorkList
    }
    await createCbcFile(params);

    return { cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, cbcWorkList, hosName, loading };
}

// CommonFileDataType
const commonFileData = async ({ barcodeNo, slotId, imgDriveRootPath, cbcFilePath, cbcFileName, cbcCodeList } :CommonFileDataType) => {
    let [cbcPatientNm, cbcPatientNo, cbcSex, cbcAge, hosName] = ['', '', '', '', ''];
    let cbcWorkList: { classNm: string; count: string; unit: string }[] = [];
    let loading = false;

    const fileSysExistsFileParms = {
        directoryPath: `${cbcFilePath}`,
        keyword: barcodeNo
    };
    let fileListName = '';
    let filePath = '';
    const isExistsFile = await fileSysExistsFile(fileSysExistsFileParms);
    if (isExistsFile.data === "NoFile") {
        const fileSearchApiPram = `directoryPath=${imgDriveRootPath}\\${slotId}&searchString=${barcodeNo}`
        try {
            const response: any = await fileSearchApi(fileSearchApiPram);
            console.log('response', response);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                fileListName = response.data[0].split('.')[0];
            }
        } catch (error) {
            console.error('Error fetching file list:', error);
        }
        filePath = `${imgDriveRootPath}\\${slotId}`;
    } else {
        fileListName = cbcFileName;
        filePath = cbcFilePath
    }
    const readFileTxtRes: any = await readFileTxt(`path=${filePath}&filename=${fileListName}`);

    if (readFileTxtRes.data.success) {
        const fileParams = {
            source: `${cbcFilePath}\\${cbcFileName}.hl7`,
            destination: `${imgDriveRootPath}\\${slotId}`,
        };
        const fileSysCleanParams = {
            directoryPath: `${cbcFilePath}`,
            keyword: barcodeNo
        }
        await fileSysCopy(fileParams);
        await fileSysClean(fileSysCleanParams);
        console.log('readFileTxtRes', readFileTxtRes);
        const msg: any = await readH7File(readFileTxtRes.data.data);
        console.log('msg', msg);
        const { cbcPatientNm: localCbcPatientNm, cbcPatientNo: localCbcPatientNo, cbcSex: localCbcSex, cbcAge: localCbcAge, cbcWorkList: localCbcWorkList, hosName: localHosName} = getCBCWorkListFromFileData(msg, cbcCodeList);
        cbcPatientNm = localCbcPatientNm;
        cbcPatientNo = localCbcPatientNo;
        cbcSex = localCbcSex;
        cbcAge = localCbcAge;
        cbcWorkList = localCbcWorkList;
        hosName = localHosName;
        loading = false;  // 로딩 상태 종료
    } else {
        console.error(readFileTxtRes.data.message);
        loading = false;
    }

    return { cbcPatientNm, cbcPatientNo, cbcSex, cbcAge, cbcWorkList, hosName, loading };
}

const getCBCWorkListFromFileData = (msg: any, cbcCodeList: any) => {
    const cbcWorkList: { classNm: string; count: string; unit: string }[] = [];
    let [cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, hosName] = ['', '', '', '', ''];

    msg?.data?.segments?.forEach((cbcSegment: any) => {
        const segmentName = cbcSegment.name.trim();

        if (segmentName === 'OBX') {
            cbcCodeList.forEach((cbcCode: any) => {
                const classCd = cbcSegment?.fields?.[2]?.value?.[0]?.[0]?.value?.[0];
                const count = cbcSegment?.fields?.[4]?.value?.[0]?.[0]?.value?.[0] || "0";
                const unit = cbcSegment?.fields?.[2]?.value?.[0]?.[0]?.value?.[0].match(/%/g)?.[0] || "";

                // 클래스 코드가 일치하는 경우
                if (cbcCode.classCd === classCd) {
                    // 중복 확인: 이미 동일한 classNm이 있는지 확인
                    const isDuplicate = cbcWorkList.some(
                        (item: any) => item.classNm === cbcCode.fullNm
                    );

                    // 중복이 아닐 경우에만 추가
                    if (!isDuplicate) {
                        const obj = {
                            classNm: cbcCode.fullNm,
                            count: count,
                            unit
                        };
                        cbcWorkList.push(obj);
                    }
                }
            });
        }
        else if(cbcSegment.name.trim() === 'FLG'){
            const flgNm = cbcSegment?.fields?.[2]?.value?.[0]?.[0]?.value?.[0];
            const obj = {
                classNm: 'FLG',
                count: flgNm,
                unit: '',
            };
            cbcWorkList.push(obj);
        }
        else if (cbcSegment.name.trim() === 'PID') {
            cbcPatientNo = cbcSegment.fields[1].value[0][0].value[0]
            cbcPatientNm = cbcSegment.fields[4].value[0][0].value[0]
            cbcSex = cbcSegment.fields[6].value[0][0].value[0]
            cbcAge = cbcSegment.fields[7].value[0][0].value[0];
            hosName = cbcSegment?.fields[10]?.value[0][0]?.value[0];
        }
    });

    return {
        cbcWorkList,
        cbcPatientNo,
        cbcPatientNm,
        cbcSex,
        cbcAge,
        hosName
    }
}