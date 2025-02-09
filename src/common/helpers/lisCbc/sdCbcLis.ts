import {getCbcPathData} from "@/common/helpers/lisCbc/inhaCbcLis";
import {readCustomH7Message, readFileEUCKR, readH7File} from "@/common/api/service/fileReader/fileReaderApi";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";
import axios from "axios";
import {cbcFileNameExtract} from "@/common/helpers/lisCbc/index";
import {
    createCbcFile,
    fileSearchApi,
    fileSysClean,
    fileSysCopy,
    fileSysExistsFile
} from "@/common/api/service/fileSys/fileSysApi";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";

interface SdCBCType {
    iaRootPath: string;
    cbcFilePathSetArr: string;
    slotId: string;
    barcodeNo: string;
    firstCbcDatafilename: string;
    cbcCodeList: any;
}

export const lisSendSD = async (barcodeNo: string, nowCrcData: any, lisFilePathSetArr: string, patientNm: string) => {
    const fileNm = await cbcFileNameExtract(barcodeNo);
    const path = await getCbcPathData();
    const readFileTxtRes: any = await readFileEUCKR(`path=${path}&filename=${fileNm}`);
    let patientId = '';
    let patientName = '';
    if (readFileTxtRes.data.success) {
        const msg: any = await readH7File(readFileTxtRes.data.data);
        msg?.data?.segments?.forEach((cbcSegment: any) => {
            if (cbcSegment.name.trim() === 'PID') {
                patientId = cbcSegment.fields[2].value[0][0].value[0]
                patientName = cbcSegment.fields[4].value[0][0].value[0]
            }
        })
    }
    const data = {
        sendingApp: 'PBIA',
        sendingFacility: 'PBIA',
        receivingApp: 'LIS',
        receivingFacility: 'LIS',
        dateTime: getDateTimeStr(),
        security: '',
        messageType: ['ADT', 'R02'],
        messageControlId: barcodeNo,
        processingId: 'P',
        hl7VersionId: '2.5',
        customData: nowCrcData,
        pidData: {patientId: barcodeNo, patientName: patientNm !== '' && patientNm ? patientNm : patientName},
    };
    const res = await readCustomH7Message(data);
    if (res) {
        return await lisHttpSendSD(res, barcodeNo, lisFilePathSetArr);
    }
}

const lisHttpSendSD = async (resultStr: any, barcodeNo: string, lisFilePathSetArr: string) => {
    const body = {
        apiKey: 'M0ZGODgyREY4NzUxMkY4RTM0MERDRkMyRkQ1MDM3OEU=',
        interfaceId: '01',
        dataText: resultStr.data,
    };

    const res = await axios.post(`${lisFilePathSetArr}`, body, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (res?.data.code === 200) {
        return 'Success';
    } else {
        return res?.data?.msg || 'Lis Send Fail';
    }
}

export const sdWorklistsAPI = async (date: any) => {
    const body = {
        apiKey: 'M0ZGODgyREY4NzUxMkY4RTM0MERDRkMyRkQ1MDM3OEU=',
        interfaceId: '01',
        workDate: date,
    };

    const res = await axios.post(`http://121.169.55.132:8081/api/interface/worklists`, body, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (res?.data.code === 200) {
        return {data: res?.data, code: res?.data.code};
    } else {
        return {data: null, code: res?.data.code};
    }
}

export const sdPatientNameGetAPI = async (reqNoList: string[], workDateStart: string, workDateEnd: string) => {
    const body = {
        apiKey: 'M0ZGODgyREY4NzUxMkY4RTM0MERDRkMyRkQ1MDM3OEU=',
        interfaceId: '01',
        reqNoList: reqNoList ?? [],
        workDateStart: workDateStart,
        workDateEnd: workDateEnd,
    }

    const res = await axios.post(`http://121.169.55.132:8081/api/interface/patnames`, body, {
        headers: { 'Content-Type': 'application/json' }
    })
    if (res?.data.code === 200) return { data: res?.data, code: res?.data.code };
    return { data: null, code: res?.data.code };
}

export const sdCBC = async ({ iaRootPath, cbcFilePathSetArr, slotId, barcodeNo, firstCbcDatafilename, cbcCodeList }: SdCBCType) => {
    let cbcPatientNo = '';
    let cbcPatientNm = '';
    let cbcSex = '';
    let cbcAge = '';
    let hosName = '';
    let fileListName = '';
    let filePath = '';
    let loading = false;
    const cbcWorkList: any[] = [];
    const cbcWorkListForShow: any[] = [];

    const fileSysExistsFileParms = {
        directoryPath: `${cbcFilePathSetArr}`,
        keyword: barcodeNo
    };

    const isExistsFile = await fileSysExistsFile(fileSysExistsFileParms);
    if (isExistsFile.data === "NoFile") {
        const fileSearchApiPram = `directoryPath=${iaRootPath}\\${slotId}&searchString=${barcodeNo}`
        try {
            const response: any = await fileSearchApi(fileSearchApiPram);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                fileListName = response.data[0].split('.')[0];
            }
        } catch (error) {
            console.error('Error fetching file list:', error);
        }
        filePath = `${iaRootPath}\\${slotId}`;
    } else {
        fileListName = firstCbcDatafilename;
        filePath = cbcFilePathSetArr
    }
    const readFileTxtRes: any = await readFileEUCKR(`path=${filePath}&filename=${fileListName}`);

    if (readFileTxtRes.data.success) {
        const fileParams = {
            source: `${cbcFilePathSetArr}\\${firstCbcDatafilename}.hl7`,
            destination: `${iaRootPath}\\${slotId}`,
        };

        const fileSysCleanParams = {
            directoryPath: `${cbcFilePathSetArr}`,
            keyword: barcodeNo
        }

        await fileSysCopy(fileParams);
        await fileSysClean(fileSysCleanParams);
        const msg: any = await readH7File(readFileTxtRes.data.data);

        const onlyObx = msg?.data.segments.filter((item: any) => item.name.trim() === 'OBX');

        msg?.data?.segments?.forEach((cbcSegment: any) => {
            const segmentName = cbcSegment.name.trim();

            if (segmentName === 'OBX') {
                cbcCodeList.forEach((cbcCode: any) => {
                    const classCd = cbcSegment?.fields?.[2]?.value?.[0]?.[0]?.value?.[0];
                    const sanitizedClassCd = classCd?.replace(/[^a-zA-Z]/g, '');

                    const absItem = onlyObx.find((item: any) => {
                        const tmpClassCd = item.fields?.[2]?.value?.[0]?.[0]?.value?.[0];
                        const sanitizedClassCd2 = tmpClassCd?.replace(/[^a-zA-Z]/g, '');
                        return sanitizedClassCd === sanitizedClassCd2 && !tmpClassCd.includes('%');
                    })

                    // absCount =>
                    const count = cbcSegment?.fields?.[4]?.value?.[0]?.[0]?.value?.[0] || "0";
                    const unit = cbcSegment?.fields?.[2]?.value?.[0]?.[0]?.value?.[0].match(/%/g)?.[0] || "";
                    const showObj = {
                        classNm: cbcCode.fullNm,
                        unit: unit,
                    }

                    if (unit !== '%') {
                        Object.assign(showObj, { absCount: count, absUnit: unit });
                    }

                    if (absItem) {
                        const absCount = absItem.fields?.[4]?.value?.[0]?.[0]?.value?.[0] || "0";
                        if (unit === '%') {
                            Object.assign(showObj, { absCount: absCount, percentCount: count });
                        }
                    }

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
                            cbcWorkListForShow.push(showObj);
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

                const showObj = {
                    classNm: 'FLG',
                    absCount: flgNm,
                    unit: '',
                }
                cbcWorkList.push(obj);
                cbcWorkListForShow.push(showObj);
            }
            else if (cbcSegment.name.trim() === 'PID') {
                cbcPatientNo = cbcSegment.fields[1].value[0][0].value[0]
                cbcPatientNm = cbcSegment.fields[4].value[0][0].value[0]
                cbcSex = cbcSegment.fields[6].value[0][0].value[0]
                cbcAge = cbcSegment.fields[7].value[0][0].value[0];
                hosName = cbcSegment?.fields[10]?.value[0][0]?.value[0];
            }
        });

        loading = false;  // 로딩 상태 종료
    } else {
        console.error(readFileTxtRes.data.message);
        loading = false;
    }

    const parms = {
        filePath: `D:\\UIMD_Data\\UI_Log\\CBC_IA\\${barcodeNo}.txt`,
        data: cbcWorkList,
    };
    await createCbcFile(parms);

    return { loading, cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, hosName, cbcWorkList, cbcWorkListForShow }
}