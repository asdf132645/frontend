import {messages} from "@/common/defines/constFile/constantMessageText";
import {inhaCbcTestCode} from "@/common/defines/constFile/inhaCbcTestCode";
import {createCbcFile} from "@/common/api/service/fileSys/fileSysApi";
import store from "@/store";
import {
    getCbcCodeRbcApi,
    getFilePathSetApi,
    getLisCodeApi,
    getLisCodeRbcApi
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
    const filePath = `D:\\UIMD_Data\\UI_Log\\CBC_IA`;
    const readFileTxtRes: any = await readFileTxt(`path=${filePath}&filename=${selectItems?.barcodeNo}`);
    if (readFileTxtRes?.data?.success && funcType !== 'lisUpload') {
        cbcDataArray = JSON.parse(readFileTxtRes?.data?.data?.toString());
        const [ { cbcPatientNo, cbcPatientNm, cbcSex, cbcAge } ] = cbcDataArray;
        cbcWorkList = cbcDataArray;
        return { cbcWorkList, errMessage, cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, inhaTestCode, loading };

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
            const response: any = await axios.post(`${apiBaseUrl}/cbc/executePostCurl`, body);
            // 상태 초기화
            // 응답 데이터 가져오기
            const res: any = response.data[0];
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
                        cbcPatientNo :res?.regNo,
                        cbcPatientNm :res?.name,
                        cbcSex :res?.sex,
                        cbcAge :res?.age,
                    };
                    cbcWorkList.push(obj);
                }
            });
            }
            else{
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
    console.log('인하대 테스트 wbcInfoAfter', wbcInfoAfter)
    console.log('인하대 테스트 rbcInfoAfter', rbcInfoAfter)
    console.log('인하대 테스트 barcodeNo', barcodeNo)
    let errMessage = '';
    let lisBtnColor = false;
    if (lisFilePathSetArr === '') {
        errMessage = messages.UPLOAD_PLEASE_LIS;
        return {errMessage};
    }
    let resultStr = '';
    // `inhaTestCode.value`를 콤마로 분리하여 배열 생성 inhaTestCode는 인하대 lis 업로드 하면 cbc 코드에서 받은 응답 값을 담는 부분
    const testCodeList = inhaTestCode.split(',');
    // 변환된 데이터를 저장할 리스트 초기화
    const tmpList: string[] = [];
    // `testCodeList` 배열을 순회하면서 각 코드에 대해 처리
    testCodeList.forEach((codes: any) => {
        if (codes.length > 0) {
            // 코드 데이터를 '|'로 분리하여 배열 생성
            const codeArray = codes.split('|')
            const code = codeArray[0]
            const value = codeArray[1]
            const unit = codeArray[2]
            const type = codeArray[3]
            let tmpStr = ''
            if (code === 'L0210') {
                // 'L0210' 코드는 값에 '5'를 추가
                tmpStr = `${value}5|`;
            } else if (code === 'H1151') {
                tmpStr = `H9511|${value}|`;
            } else if (code === 'H1152') {
                tmpStr = `H9512|${value}|`;
            } else if (code === 'H1153') {
                tmpStr = `H9513|${value}|`;
            } else if (code === 'H1154') {
                tmpStr = `H9514|${value}|`;
            } else if (code === 'H1155') {
                tmpStr = `H9515|${value}|`;
            } else if (code === 'H1165') {
                tmpStr = `H9510|${value}|`;
            } else if (code === 'H1162') {
                tmpStr = `H9570|${value}|`;
            } else if (
                ['H1101', 'H1102', 'H1103', 'H1104', 'H1105', 'H1106', 'H1121', 'H1122', 'H1123'].includes(code)
            ) {
                tmpStr = `${code}|${value}|`;
            }
            // 변환된 문자열을 `tmpList`에 추가
            if (tmpStr) {
                tmpList.push(tmpStr);
            }
        }
    });
    // `inhaTestCode.value`를 빈 문자열로 초기화
    let inhaTestSendCode = '';
    // `tmpList`의 항목을 콤마로 연결하여 `inhaTestCode.value`에 저장
    inhaTestSendCode = tmpList.join(','); // tmpList.join(',') 결과는 'a,b,c' 이런식으로 만드려고 join 사용 함
    // `resultStr`에 `inhaTestCode.value`를 추가
    resultStr += inhaTestSendCode;
    console.log('tmpList 가공 매칭 후', tmpList)
    console.log('inhaTestSendCode.value cbc 값 얻어와서 매칭 시킨 후 변경된 배열', inhaTestSendCode)
    console.log('inhaTestSendCode.value', inhaTestSendCode)
    let rbcTmp = '';
    // WBC 항목을 처리하는 함수 정의
    const processWbcItem = (lisCode: any, wbcItem: any) => {
        const lisCodeLIS_CD = lisCode.LIS_CD;
        const count = Number(wbcItem.count);
        const percent = wbcItem.percent;

        // 특정 LIS_CD 값들에 대해 count가 0보다 큰 경우 '1'을, 그렇지 않으면 ' '를 추가
        if (['H9600', 'H9365', 'H9366'].includes(lisCodeLIS_CD)) {
            resultStr += lisCodeLIS_CD + '|' + (count > 0 ? '1' : ' ') + '|' + ',';
        }
        //  GP, PA IA_CD가 '13' 또는 '14'인 경우 count가 MIN_COUNT보다 큰지 확인
        else if (['13', '14'].includes(lisCode.IA_CD)) {
            resultStr += lisCodeLIS_CD + '|' + (count > Number(lisCode.MIN_COUNT) ? percent : ' ') + '|' + ',';
        }
        // 나머지 경우에는 percent가 0보다 큰지 확인
        else {
            resultStr += lisCodeLIS_CD + '|' + (percent > 0 ? percent : ' ') + '|' + ',';
        }
    };

    // lisCodeWbcArr의 각 항목에 대해
    lisCodeWbcArr.forEach((lisCode: any) => {
        // wbcInfoAfter의 각 항목을 확인
        wbcInfoAfter.forEach((wbcItem: any) => {
            // lisCode의 IA_CD가 wbcItem의 id와 같다면
            if (lisCode.IA_CD === wbcItem.id) {
                // WBC 항목을 처리
                processWbcItem(lisCode, wbcItem);
            }
        });
    });

    // RBC
    const specialCodes = ['H9531', 'H9535', 'H9594', 'H9571', 'H9574', 'H9595'];

    lisCodeRbcArr.forEach(function (lisCode: any) {
        if (lisCode.LIS_CD !== '') {
            rbcInfoAfter.forEach(function (rbcItem: any) {
                if (lisCode.IA_CATEGORY_CD === rbcItem.IA_CATEGORY_CD) {
                    for (const rbcItemElement of rbcItem.classInfo) {
                        if (lisCode.IA_CLASS_CD === rbcItemElement.IA_CLASS_CD) {
                            const degree = Number(rbcItemElement.degree) === 0 ? ' ' : specialCodes.includes(lisCode.LIS_CD) ? '0' : rbcItemElement.degree;
                            rbcTmp += `${lisCode.LIS_CD}|${degree}|,`;
                            resultStr += `${lisCode.LIS_CD}|${degree}|,`;
                        }
                    }

                }
            })

        }
    })
    console.log('rbc wbc 중간 resultStr 값', resultStr);
    const replacements: any = {
        'H9531': 'H9571',
        'H9532': 'H9572',
        'H9533': 'H9573',
        'H9535': 'H9574',
        'H9536': 'H9575',
        'H9537': 'H9576',
        'H9534': 'H9577',
        'H9538': 'H9578',
        'H9542': 'H9518',
        'H9544': 'H9520',
        'H9546': 'H9517',
        'H9548': 'H9519',
        'H9550': 'H9522',
        'H9552': 'H9521',
        'H9554': 'H9525',
        'H9556': 'H9524',
        'H9558': 'H9526',
        'H9560': 'H9523',
        'H9562': 'H9528',
        'H9564': 'H9530',
        'H9594': 'H9595'
    };
    // 위에서 담은 rbcTmp 정규 표현식을 사용해서 문자열 코드 대체
    const rbcTmp2: any = rbcTmp.replace(/H9531|H9532|H9533|H9535|H9536|H9537|H9534|H9538|H9542|H9544|H9546|H9548|H9550|H9552|H9554|H9556|H9558|H9560|H9562|H9564|H9594/g, match => replacements[match]);

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

const resRunningItem = async (updatedRuningInfo: any, noAlert?: boolean, id?: any, ) => {
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

    return { wbcMemo , message }
}


export const getLisWbcRbcData = async () => {
    let lisCodeWbcArr:any = [];
    let lisCodeRbcArr: any = [];
    try {
        const wbcResult = await getLisCodeApi();
        const rbcResult = await getLisCodeRbcApi();
        if (wbcResult && wbcResult.data && rbcResult && rbcResult.data) {
            const wbcData = wbcResult.data;
            const rbcData = rbcResult.data;

            if (wbcData) {
                const newWbcDataArr = [];
                for (const wbcDataItem of wbcData) {
                    newWbcDataArr.push({
                        CD_NM: wbcDataItem.fullNm,
                        IA_CD: wbcDataItem?.id,
                        LIS_CD: wbcDataItem?.key,
                        MIN_COUNT: 0,
                    })
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
    return { lisCodeWbcArr , lisCodeRbcArr }
};

export const getLisPathData = async () => {
    let lisFilePathSetArr = '';
    try {
        const result = await getFilePathSetApi();
        if (result && result.data && result.data.length !== 0) {
            lisFilePathSetArr = result.data[0].lisFilePath;
        }
    } catch (e) {
        console.error(e);
    }

    return lisFilePathSetArr;
};
