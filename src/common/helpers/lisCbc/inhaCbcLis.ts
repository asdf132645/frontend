import {MESSAGES} from "@/common/defines/constants/constantMessageText";
import {inhaCbcTestCode} from "@/common/defines/constants/inhaCbcTestCode";
import {createCbcFile} from "@/common/api/service/fileSys/fileSysApi";
import {
    getCbcCodeRbcApi,
    getFilePathSetApi,
    getLisCodeApi,
    getLisCodeRbcApi, getMinCountApi
} from "@/common/api/service/setting/settingApi";
import axios from "axios";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {readFileTxt} from "@/common/api/service/fileReader/fileReaderApi";
import {computed} from "vue";
import {useStore} from "vuex";
import moment from "moment/moment";
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const slideData = computed(() => store.state.slideDataModule);

export const inhaCbc = async (cbcFilePathSetArr: any, selectItems: any, cbcCodeList: any, funcType: string) => {
    console.log('인하대 CBC 데이터 받기 - inhaCbc cbcFilePathSetArr', cbcFilePathSetArr);
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
        errMessage = MESSAGES.UPLOAD_PLEASE_CBC;
        return {cbcWorkList, errMessage, cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, inhaTestCode, loading}
    }

    if (cbcFilePathSetArr.includes("http")) { // url 설정인 경우
        try {
            const apiBaseUrl = window.APP_API_BASE_URL;
            const body = {
                machine: 'ADUIMD',
                episode: selectItems.barcodeNo,
                baseUrl: `${cbcFilePathSetArr}/api/MifMain/Order`,
                // baseUrl: `${apiBaseUrl}/cbc/executePostCurltest`,
            };
            const response: any = await axios.post(`${apiBaseUrl}/cbc/executePostCurl`, body);
            // 상태 초기화
            // 응답 데이터 가져오기
            const correctedString = response.data.replace(/\\"/g, '"'); // 이스케이프된 따옴표 제거
            const jsonObject = JSON.parse(correctedString); // JSON 객체로 변환

            console.log(jsonObject[0]); // 파싱된 JSON 객체 출력
            const res: any = jsonObject[0];
            // const res: any = inhaCbcTestCode[0];

            // 응답 코드가 '0'일 때만 처리
            if (res?.returnCode === '0') {
                // 환자 정보 설정
                cbcPatientNo = res?.regNo;
                cbcPatientNm = res?.name;
                cbcSex = res?.sex;
                cbcAge = res?.age;
                inhaTestCode = res?.testCode;
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
                            testCode: res.testCode
                        };
                        cbcWorkList.push(obj);
                    }
                });
                const parms = {
                    filePath: `D:\\UIMD_Data\\UI_Log\\CBC_IA\\${selectItems?.barcodeNo}.txt`,
                    data: cbcWorkList,
                };
                await createCbcFile(parms);
            } else {
                errMessage = res?.returnCode;
                loading = false;
                return {cbcWorkList, errMessage, cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, inhaTestCode, loading};
            }
            const filePath = `D:\\UIMD_Data\\UI_Log\\CBC_IA`;
            const readFileTxtRes: any = await readFileTxt(`path=${filePath}&filename=${selectItems?.barcodeNo}`);
            if (readFileTxtRes?.data?.success && (res?.returnCode !== '0')) {
                console.log(readFileTxtRes?.data?.data)
                cbcDataArray = JSON.parse(readFileTxtRes?.data?.data?.toString());
                const [{cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, testCode}] = cbcDataArray;
                await store.dispatch('commonModule/setCommonInfo', {inhaTestCode: testCode});
                cbcWorkList = cbcDataArray;
                return {cbcWorkList, errMessage, cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, inhaTestCode, loading};
            }

            loading = false;
            // console.log('Response:', response.data);
        } catch (error: any) {
            console.error(error.message + ' : no CBC result');
            loading = false;
            errMessage = error.message;
        }
    }
    return {cbcWorkList, errMessage, cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, inhaTestCode, loading}
}

export const inhaDataSend = async (wbcInfoAfter: any, rbcInfoAfter: any, barcodeNo: any, lisFilePathSetArr: any, inhaTestCode: any, lisCodeWbcArr: any, lisCodeRbcArr: any, selectItems: any, id: any) => {
    console.log('Lis 업로드 로직 시작');
    console.log('인하대 테스트 wbcInfoAfter', wbcInfoAfter)
    console.log('인하대 테스트 rbcInfoAfter', rbcInfoAfter)
    console.log('인하대 테스트 barcodeNo', barcodeNo)
    let errMessage = '';
    let lisBtnColor = false;
    if (lisFilePathSetArr === '') {
        errMessage = MESSAGES.UPLOAD_PLEASE_LIS;
        return {errMessage};
    }
    let resultStr = '';
    // `inhaTestCode.value`를 콤마로 분리하여 배열 생성 inhaTestCode는 인하대 lisCbc 업로드 하면 cbc 코드에서 받은 응답 값을 담는 부분
    const testCodeList = inhaTestCode.split(',');
    // 변환된 데이터를 저장할 리스트 초기화
    const tmpList: string[] = [];
    // `testCodeList` 배열을 순회하면서 각 코드에 대해 처리
    testCodeList.forEach((codes: any) => {
        if (codes.length > 0) {
            const codeArray = codes.split('|')
            const code = codeArray[0]
            let value = codeArray[1]

            let tmpStr = ''

            if (code === 'L0210') {
                value = value + '5'
            }

            if (code === 'H1151') {
                tmpStr += 'H9511' + '|' + value + '|' //+ unit // + '\\' + type
                tmpList.push(tmpStr)
            } else if (code === 'H1152') {
                tmpStr += 'H9512' + '|' + value + '|' //+ unit // + '\\' + type
                tmpList.push(tmpStr)
            } else if (code === 'H1153') {
                tmpStr += 'H9513' + '|' + value + '|' //+ unit // + '\\' + type
                tmpList.push(tmpStr)
            } else if (code === 'H1154') {
                tmpStr += 'H9514' + '|' + value + '|' //+ unit // + '\\' + type
                tmpList.push(tmpStr)
            } else if (code === 'H1155') {
                tmpStr += 'H9515' + '|' + value + '|' //+ unit // + '\\' + type
                tmpList.push(tmpStr)
            } else if (code === 'H1165') {
                tmpStr += 'H9510' + '|' + value + '|' //+ unit // + '\\' + type
                tmpList.push(tmpStr)
            } else if (code === 'H1162') {
                tmpStr += 'H9570' + '|' + value + '|' //+ unit // + '\\' + type
                tmpList.push(tmpStr)
            } else if (code === 'H1101' || code === 'H1102' || code === 'H1103' ||
                code === 'H1104' || code === 'H1105' || code === 'H1106' ||
                code === 'H1121' || code === 'H1122' || code === 'H1123') {
                tmpStr += code + '|' + value + '|' //+ unit // + '\\' + type
                tmpList.push(tmpStr)
            }
        }
    });
    // `inhaTestCode.value`를 빈 문자열로 초기화
    let inhaTestSendCode = '';
    tmpList.forEach(function (item) {
        inhaTestSendCode += item + ','
    })
    // `resultStr`에 `inhaTestCode.value`를 추가
    resultStr += inhaTestSendCode;
    console.log('tmpList 가공 매칭 후', JSON.stringify(tmpList))
    console.log('inhaTestSendCode.value cbc 값 얻어와서 매칭 시킨 후 변경된 배열', inhaTestSendCode)
    console.log('inhaTestSendCode.value', inhaTestSendCode)
    // WBC 항목을 처리하는 함수 정의
    lisCodeWbcArr.forEach(function (lisCode: any, index: any) {
        if (lisCode.LIS_CD !== '') {
            wbcInfoAfter.forEach(function (wbcItem: any) {
                if (Number(lisCode.IA_CD) === Number(wbcItem.id)) {
                    if (lisCode.LIS_CD === 'H9600' || lisCode.LIS_CD === 'H9365' ||
                        lisCode.LIS_CD === 'H9366') {
                        if (Number(wbcItem.count > 0)) {
                            resultStr += lisCode.LIS_CD + '|' + '1' + '|' + ','
                        } else if (wbcItem.title !== 'NS' || wbcItem.title !== 'LY' || wbcItem.title !== 'EO' || wbcItem.title !== 'BA' || wbcItem.title !== 'MO') {
                            resultStr += lisCode.LIS_CD + '|' + ' ' + '|' + ','
                            // resultStr += lisCode.LIS_CD + '|' + '0' + '|' + ','
                        } else {
                            // resultStr += lisCode.LIS_CD + '|' + ' ' + '|' + ','
                            resultStr += lisCode.LIS_CD + '|' + '0.0' + '|' + ','
                        }
                    } else {
                        // GP, PA
                        if (lisCode.IA_CD === '13' || lisCode.IA_CD === '14') {
                            if (Number(wbcItem.count) > Number(lisCode.MIN_COUNT)) {
                                resultStr += lisCode.LIS_CD + '|' + wbcItem.percent + '|' + ','
                            } else {
                                resultStr += lisCode.LIS_CD + '|' + ' ' + '|' + ','
                                // resultStr += lisCode.LIS_CD + '|' + '0' + '|' + ','
                            }
                        } else {
                            if (Number(wbcItem.percent) > 0) {
                                resultStr += lisCode.LIS_CD + '|' + wbcItem.percent + '|' + ','
                            } else if (wbcItem.title !== 'NS' || wbcItem.title !== 'LY' || wbcItem.title !== 'EO' || wbcItem.title !== 'BA' || wbcItem.title !== 'MO') {
                                resultStr += lisCode.LIS_CD + '|' + ' ' + '|' + ','
                            } else {
                                // resultStr += lisCode.LIS_CD + '|' + ' ' + '|' + ','
                                resultStr += lisCode.LIS_CD + '|' + '0.0' + '|' + ','
                            }
                        }
                    }
                }
            })
        }
    })

    // RBC
    let rbcTmp: any = ''
    lisCodeRbcArr.forEach(function (lisCode: any) {
        if (lisCode.LIS_CD !== '') {
            rbcInfoAfter.forEach(function (rbcItem: any) {
                if (lisCode.IA_CATEGORY_CD === rbcItem.categoryId &&
                    lisCode.IA_CLASS_CD === rbcItem.classId) {
                    if (lisCode.LIS_CD === 'H9531' || lisCode.LIS_CD === 'H9535' ||
                        lisCode.LIS_CD === 'H9594' || lisCode.LIS_CD === 'H9571' ||
                        lisCode.LIS_CD === 'H9574' || lisCode.LIS_CD === 'H9595') {
                        if (Number(rbcItem.degree) === 0) {
                            rbcItem.degree = ' '
                        } else {
                            rbcItem.degree = '0'
                        }

                        rbcTmp += lisCode.LIS_CD + '|' + rbcItem.degree + '|' + ','
                        resultStr += lisCode.LIS_CD + '|' + rbcItem.degree + '|' + ','

                    } else {
                        if (Number(rbcItem.degree) === 0) {
                            rbcItem.degree = ' '
                        }
                        rbcTmp += lisCode.LIS_CD + '|' + rbcItem.degree + '|' + ','
                        resultStr += lisCode.LIS_CD + '|' + rbcItem.degree + '|' + ','

                    }
                }
            })
        }
    })

    let rbcTmp2 = rbcTmp
    rbcTmp2 = rbcTmp2.replace('H9531', 'H9571')
    rbcTmp2 = rbcTmp2.replace('H9532', 'H9572')
    rbcTmp2 = rbcTmp2.replace('H9533', 'H9573')
    rbcTmp2 = rbcTmp2.replace('H9535', 'H9574')
    rbcTmp2 = rbcTmp2.replace('H9536', 'H9575')
    rbcTmp2 = rbcTmp2.replace('H9537', 'H9576')
    rbcTmp2 = rbcTmp2.replace('H9534', 'H9577')
    rbcTmp2 = rbcTmp2.replace('H9538', 'H9578')
    rbcTmp2 = rbcTmp2.replace('H9542', 'H9518')
    rbcTmp2 = rbcTmp2.replace('H9544', 'H9520')
    rbcTmp2 = rbcTmp2.replace('H9546', 'H9517')
    rbcTmp2 = rbcTmp2.replace('H9548', 'H9519')
    rbcTmp2 = rbcTmp2.replace('H9550', 'H9522')
    rbcTmp2 = rbcTmp2.replace('H9552', 'H9521')
    rbcTmp2 = rbcTmp2.replace('H9554', 'H9525')
    rbcTmp2 = rbcTmp2.replace('H9556', 'H9524')
    rbcTmp2 = rbcTmp2.replace('H9558', 'H9526')
    rbcTmp2 = rbcTmp2.replace('H9560', 'H9523')
    rbcTmp2 = rbcTmp2.replace('H9562', 'H9528')
    rbcTmp2 = rbcTmp2.replace('H9564', 'H9530')
    rbcTmp2 = rbcTmp2.replace('H9594', 'H9595')

    resultStr += rbcTmp
    resultStr += rbcTmp2
    console.log('rbc wbc 최종 resultStr 값', resultStr);
    try {
        const apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';

        const body = {
            baseUrl: `${lisFilePathSetArr}/api/MifMain/File`,
            machine: 'ADUIMD',
            episode: barcodeNo,
            result: resultStr,
            // baseUrl: `${apiBaseUrl}/cbc/executePostCurltest`,
        };

        const response = await axios.post(`${apiBaseUrl}/cbc/executePostCurl`, body);
        const correctedString = response.data.replace(/\\"/g, '"'); // 이스케이프된 따옴표 제거
        const jsonObject = JSON.parse(correctedString); // JSON 객체로 변환
        console.log(jsonObject[0]); // 파싱된 JSON 객체 출력
        const res: any = jsonObject[0];
        console.log('res 최종값', response)
        if (res?.returnCode === '0') {
            const filePath = `D:\\UIMD_Data\\UI_Log\\LIS_IA\\${selectItems?.barcodeNo}.txt`;
            const parmsLisCopy = {filePath, data: jsonObject};
            const localTime = moment().local();

            // LIS 파일 생성
            await createCbcFile(parmsLisCopy);
            if (selectItems?.id) {
                const updatedItem = {
                    submitState: 'lisCbc',
                    submitOfDate: localTime.format(),
                    submitUserId: userModuleDataGet.value.userId,

                };
                const updatedRuningInfo = {id: slideData.value.id, ...updatedItem}
                await resRunningItem(updatedRuningInfo, true, id);
            }

            lisBtnColor = true;
            errMessage = MESSAGES.IDS_MSG_SUCCESS;
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
        const response: any = await updateRunningApi({
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
                    });

                    newWbcDataArr.push({
                        CD_NM: fullNm,
                        IA_CD: classId,
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
                        IA_CLASS_CD: rbcDataItem?.classId,
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
export const getCbcPathData = async () => {
    let cbcFilePathSetArr = '';
    try {
        const result = await getFilePathSetApi();

        if (result && result.data) {
            const data = result?.data;
            cbcFilePathSetArr = data[0]?.cbcFilePath;
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