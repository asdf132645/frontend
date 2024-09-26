import {messages} from "@/common/defines/constFile/constantMessageText";
import {inhaCbcTestCode} from "@/common/defines/constFile/inhaCbcTestCode";
import {createCbcFile} from "@/common/api/service/fileSys/fileSysApi";
import store from "@/store";
import {
    getCbcCodeRbcApi,
    getFilePathSetApi,
    getLisCodeApi,
    getLisCodeRbcApi, getMinCountApi
} from "@/common/api/service/setting/settingApi";
import axios from "axios";
import {detailRunningApi, updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {readFileTxt} from "@/common/api/service/fileReader/fileReaderApi";

export const inhaCbc = async (cbcFilePathSetArr: any, selectItems: any, cbcCodeList: any, funcType: string) => {
    console.log('인하대 CBC 데이터 받기');
    console.log('inhaCbc cbcFilePathSetArr', cbcFilePathSetArr);
    let errMessage = '';
    let loading = false;
    let cbcWorkList: any = [];
    let cbcPatientNo = '';
    let cbcPatientNm = '';
    let cbcSex = '';
    let cbcAge = '';
    let inhaTestCode = '';
    let cbcDataArray = [];

    if (cbcFilePathSetArr === '') {
        errMessage = messages.UPLOAD_PLEASE_CBC;
        return {cbcWorkList, errMessage, cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, inhaTestCode, loading}
    }

    if (cbcFilePathSetArr.includes("http")) { // url 설정인 경우
        try {
            const apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';

            const body = {
                machine: 'ADUIMD',
                episode: selectItems.barcodeNo,
                baseUrl: `${cbcFilePathSetArr}/api/MifMain/Order`,
                // baseUrl: `${apiBaseUrl}/cbc/executePostCurltest`,
            };
            // const response: any = await axios.post(`${apiBaseUrl}/cbc/executePostCurl`, body);
            // 상태 초기화
            // 응답 데이터 가져오기
            // const res: any = response.data[0];
            const res: any = inhaCbcTestCode[0];
            const filePath = `D:\\UIMD_Data\\UI_Log\\CBC_IA`;
            const readFileTxtRes: any = await readFileTxt(`path=${filePath}&filename=${selectItems?.barcodeNo}`);
            if (readFileTxtRes?.data?.success && (res?.returnCode !== '0')) {
                console.log(readFileTxtRes?.data?.data)
                cbcDataArray = JSON.parse(readFileTxtRes?.data?.data?.toString());
                const [{cbcPatientNo, cbcPatientNm, cbcSex, cbcAge}] = cbcDataArray;
                cbcWorkList = cbcDataArray;
                return {cbcWorkList, errMessage, cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, inhaTestCode, loading};
            }
            // 응답 코드가 '0'일 때만 처리
            if (res?.returnCode === '0') {
                // 환자 정보 설정
                cbcPatientNo = res?.regNo;
                cbcPatientNm = res?.name;
                cbcSex = res?.sex;
                cbcAge = res?.age;
                inhaTestCode = res?.testCode;
                console.log(res?.testCode);
                // 공통 정보 설정
                await store.dispatch('commonModule/setCommonInfo', {inhaTestCode: res?.testCode});

                // 테스트 코드 리스트 처리
                const testCodeList = res.testCode.split(',');
                testCodeList.forEach((codes: any) => {
                    const codeArray = codes.split('|');
                    const code = codeArray[0];
                    const value = codeArray[1];
                    const unit = codeArray[2];

                    // cbcCodeList에서 매칭되는 코드 찾기
                    const cbcCode = cbcCodeList.find((cbcCode: any) => cbcCode.classCd === code);
                    if (cbcCode) {
                        // 작업 리스트에 추가
                        const obj = {
                            classNm: cbcCode.fullNm,
                            count: value || 0,
                            unit: unit || '', // unit이 없으면 빈 문자열로 설정
                            cbcPatientNo: res?.regNo,
                            cbcPatientNm: res?.name,
                            cbcSex: res?.sex,
                            cbcAge: res?.age,
                        };
                        cbcWorkList.push(obj);
                    }
                });
            } else {
                errMessage = res?.returnCode;
                loading = false;
                return {cbcWorkList, errMessage, cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, inhaTestCode, loading};
            }

            const parms = {
                filePath: `D:\\UIMD_Data\\UI_Log\\CBC_IA\\${selectItems?.barcodeNo}.txt`,
                data: cbcWorkList,
            };
            await createCbcFile(parms);
            loading = false;
            // console.log('Response:', response.data);
        } catch (error: any) {
            console.log(error.message + ' : no CBC result');
            loading = false;
            errMessage = error.message;
        }
    }
    return {cbcWorkList, errMessage, cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, inhaTestCode, loading}
}

export const getCbcPathData = async () => {
    let cbcFilePathSetArr = '';
    try {
        const result = await getFilePathSetApi();

        if (result && result.data) {
            const data = result.data;
            cbcFilePathSetArr = data[0].cbcFilePath;
        }
    } catch (e) {
        console.error(e);
    }
    return cbcFilePathSetArr;
};

export const getCbcCodeList = async () => {
    let cbcCodeList: any = [];
    try {
        const result = await getCbcCodeRbcApi();
        if (result && result.data) {
            cbcCodeList = result.data;
        }
    } catch (e) {
        console.error(e);
    }
    return cbcCodeList;
};


export const inhaDataSend = async (wbcInfoAfter: any, rbcInfoAfter: any, barcodeNo: any, lisFilePathSetArr: any, inhaTestCode: any, lisCodeWbcArr: any, lisCodeRbcArr: any, selectItems: any, id: any) => {
    console.log('Lis 업로드 로직 시작');
    console.log('인하대 테스트 wbcInfoAfter', wbcInfoAfter);
    console.log('인하대 테스트 rbcInfoAfter', rbcInfoAfter);
    console.log('인하대 테스트 barcodeNo', barcodeNo);

    let errMessage = '';
    let lisBtnColor = false;

    if (!lisFilePathSetArr) {
        errMessage = messages.UPLOAD_PLEASE_LIS;
        return { errMessage };
    }

    let resultStr = '';
    const testCodeList = inhaTestCode.split(',');
    const tmpList = testCodeList
        .filter((codes: any) => codes.length > 0)
        .map((codes: any) => {
            const [code, value, unit, type] = codes.split('|');
            let newValue = value;
            let tmpStr = '';

            if (code === 'L0210') newValue = `${value}5`;

            const codeMap: any = {
                'H1151': 'H9511',
                'H1152': 'H9512',
                'H1153': 'H9513',
                'H1154': 'H9514',
                'H1155': 'H9515',
                'H1165': 'H9510',
                'H1162': 'H9570',
            };

            if (codeMap[code]) {
                tmpStr = `${codeMap[code]}|${newValue}|`;
            } else if (
                ['H1101', 'H1102', 'H1103', 'H1104', 'H1105', 'H1106', 'H1121', 'H1122', 'H1123'].includes(code)
            ) {
                tmpStr = `${code}|${newValue}|`;
            }

            return tmpStr;
        }).filter((tmpStr: any) => tmpStr);  // 빈 문자열 제거

    const inhaTestSendCode = tmpList.join(',');
    resultStr += inhaTestSendCode;

    console.log('tmpList 가공 매칭 후', JSON.stringify(tmpList));
    console.log('inhaTestSendCode.value cbc 값 얻어와서 매칭 시킨 후 변경된 배열', inhaTestSendCode);
    console.log('inhaTestSendCode.value', inhaTestSendCode);

// WBC 처리 로직
    lisCodeWbcArr.forEach((lisCode: any) => {
        if (!lisCode.LIS_CD) return;

        wbcInfoAfter.forEach((wbcItem: any) => {
            if (lisCode.IA_CD === Number(wbcItem.id)) {
                const lisCodeCondition = ['H9600', 'H9365', 'H9366'].includes(lisCode.LIS_CD);

                if (lisCodeCondition) {
                    resultStr += `${lisCode.LIS_CD}|${Number(wbcItem.count) > 0 ? '1' : ' '}|,`;
                } else if (Number(wbcItem.percent) > 0) {
                    if (['13', '14'].includes(String(lisCode.IA_CD))) {
                        resultStr += Number(wbcItem.count) > Number(lisCode.MIN_COUNT)
                            ? `${lisCode.LIS_CD}|${wbcItem.percent}|,`
                            : `${lisCode.LIS_CD}| |,`;
                    } else {
                        resultStr += `${lisCode.LIS_CD}|${wbcItem.percent}|,`;
                    }
                }
            }
        });
    });

    // RBC 처리 로직
    let rbcTmp = '';
    lisCodeRbcArr.forEach((lisCode: any) => {
        if (!lisCode.LIS_CD) return;

        rbcInfoAfter.forEach((rbcItem: any) => {
            if (lisCode.IA_CATEGORY_CD === rbcItem.categoryId && lisCode.IA_CLASS_CD === rbcItem.classId) {
                const lisCodeCondition = ['H9531', 'H9535', 'H9594', 'H9571', 'H9574', 'H9595'].includes(lisCode.LIS_CD);

                if (lisCodeCondition) {
                    rbcItem.degree = Number(rbcItem.degree) === 0 ? ' ' : '0';
                } else if (Number(rbcItem.degree) === 0) {
                    rbcItem.degree = ' ';
                }

                rbcTmp += `${lisCode.LIS_CD}|${rbcItem.degree}|,`;
                resultStr += `${lisCode.LIS_CD}|${rbcItem.degree}|,`;
            }
        });
    });

// RBC 코드 치환 로직
    const rbcTmp2 = rbcTmp
        .replace(/H9531/g, 'H9571')
        .replace(/H9532/g, 'H9572')
        .replace(/H9533/g, 'H9573')
        .replace(/H9535/g, 'H9574')
        .replace(/H9536/g, 'H9575')
        .replace(/H9537/g, 'H9576')
        .replace(/H9534/g, 'H9577')
        .replace(/H9538/g, 'H9578')
        .replace(/H9542/g, 'H9518')
        .replace(/H9544/g, 'H9520')
        .replace(/H9546/g, 'H9517')
        .replace(/H9548/g, 'H9519')
        .replace(/H9550/g, 'H9522')
        .replace(/H9552/g, 'H9521')
        .replace(/H9554/g, 'H9525')
        .replace(/H9556/g, 'H9524')
        .replace(/H9558/g, 'H9526')
        .replace(/H9560/g, 'H9523')
        .replace(/H9562/g, 'H9528')
        .replace(/H9564/g, 'H9530')
        .replace(/H9594/g, 'H9595');

    resultStr += rbcTmp;
    resultStr += rbcTmp2;

    console.log('rbc wbc 최종 resultStr 값', resultStr);


    try {
        const apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';

        const body = {
            machine: 'ADUIMD',
            episode: barcodeNo,
            result: resultStr,
            baseUrl: `${lisFilePathSetArr}/api/MifMain/File`,
            // baseUrl: `${apiBaseUrl}/cbc/executePostCurltest`,
        };
        const response = await axios.post(`${apiBaseUrl}/cbc/executePostCurl`, body);
        const res = response.data[0];
        console.log('res 최종값', response)
        if (res?.returnCode === '0') {
            const filePath = `D:\\UIMD_Data\\UI_Log\\LIS_IA\\${selectItems?.barcodeNo}.txt`;
            const parmsLisCopy = {filePath, res};

            // LIS 파일 생성
            await createCbcFile(parmsLisCopy);
            const result: any = await detailRunningApi(String(selectItems?.id));
            const updatedItem = {
                submitState: 'lis',
            };
            lisBtnColor = true;
            const updatedRuningInfo = {id: result.data.id, ...updatedItem}
            await resRunningItem(updatedRuningInfo, true, id);
            errMessage = messages.IDS_MSG_SUCCESS;
        } else {
            errMessage = res?.message

        }
    } catch (error: any) {
        // 오류 처리;
        errMessage = error.message
    }
    return {errMessage, lisBtnColor}
}

const resRunningItem = async (updatedRuningInfo: any, noAlert?: boolean, id?: any,) => {
    let wbcMemo = '';
    let message = '';
    try {
        const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
        const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
        const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
        const response = await updateRunningApi({
            userId: Number(id),
            runingInfoDtoItems: [updatedRuningInfo],
            dayQuery: dayQuery,
        })
        if (response) {
            if (!noAlert) {
                message = 'success';
            }
            const filteredItems = updatedRuningInfo;
            wbcMemo = filteredItems.wbcMemo;
        } else {
            console.error('백엔드가 디비에 저장 실패함');
        }
    } catch (error) {
        console.error('Error:', error);
    }

    return {wbcMemo, message}
}


export const getLisWbcRbcData = async () => {
    let lisCodeWbcArr: any = [];
    let lisCodeRbcArr: any = [];
    try {
        const wbcResult = await getLisCodeApi();
        const rbcResult = await getLisCodeRbcApi();
        if (wbcResult && wbcResult.data && rbcResult && rbcResult.data) {
            const wbcData = wbcResult.data;
            const rbcData = rbcResult.data;
            const minCountResult: any = await getMinCountApi();

            if (wbcData) {
                const newWbcDataArr = [];
                for (const {classId, fullNm, id, key} of wbcData) {
                    const minCount = (() => {
                        switch (classId) {
                            case '13':
                                return minCountResult.data[0].minGPCount;
                            case '14':
                                return minCountResult.data[0].minPACount;
                            default:
                                return 0;
                        }
                    })();

                    newWbcDataArr.push({
                        CD_NM: fullNm,
                        IA_CD: id,
                        LIS_CD: key,
                        MIN_COUNT: minCount,
                    });
                }
                lisCodeWbcArr = newWbcDataArr;
            }
            if (rbcData) {
                const newRbcDataArr = [];
                for (const rbcDataItem of rbcData) {
                    newRbcDataArr.push({
                        CATEGORY_NM: rbcDataItem.categoryNm,
                        CLASS_NM: rbcDataItem?.fullNm,
                        IA_CATEGORY_CD: rbcDataItem?.categoryId,
                        IA_CLASS_CD: rbcDataItem?.id,
                        LIS_CD: rbcDataItem?.key,
                    })
                }
                lisCodeRbcArr = newRbcDataArr;
            }
        }
    } catch (e) {
        console.error(e);
    }
    return {lisCodeWbcArr, lisCodeRbcArr}
};

export const getLisPathData = async () => {
    let lisFilePathSetArr = '';
    let lisHotKey = '';
    try {
        const result = await getFilePathSetApi();
        if (result && result.data && result.data.length !== 0) {
            lisFilePathSetArr = result.data[0].lisFilePath;
            lisHotKey = result.data[0].lisHotKey;
        }
    } catch (e) {
        console.error(e);
    }

    return {lisFilePathSetArr, lisHotKey};
};
