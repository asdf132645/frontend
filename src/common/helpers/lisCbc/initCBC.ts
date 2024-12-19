import { HOSPITAL_SITE_CD_BY_NAME } from "@/common/defines/constants/siteCd";
import {readFileEUCKR, readH7File} from "@/common/api/service/fileReader/fileReaderApi";
import { fileSearchApi, fileSysExistsFile } from "@/common/api/service/fileSys/fileSysApi";
import { getCbcPathData } from "@/common/helpers/lisCbc/inhaCbcLis";

interface InitCBCDataType {
    barcodeNo: string;
    siteCd: string;
    userId: string;
    deviceSerialNm: string;
    imageDriveRootPath: string;
    slotId: string;
}

interface FileDataParamType {
    barcodeNo: string;
    cbcFilePathSetArr: string;
    slotId: string;
    imageDriveRootPath: string;
}

export const initCBCData = async ({ barcodeNo, siteCd, userId, deviceSerialNm, imageDriveRootPath, slotId }: InitCBCDataType) => {
    const cbcFilePathSetArr = await getCbcPathData();
    if (!cbcFilePathSetArr || cbcFilePathSetArr === '') return;

    switch (siteCd) {
        case HOSPITAL_SITE_CD_BY_NAME['SD의학연구소']:
            return await fileData({ barcodeNo, cbcFilePathSetArr, imageDriveRootPath, slotId });
        default:
            return undefined;
    }
}

const fileData = async ({ barcodeNo, imageDriveRootPath, cbcFilePathSetArr, slotId }: FileDataParamType) => {

    const fileSysExistsFileParms = {
        directoryPath: `${cbcFilePathSetArr}`,
        keyword: barcodeNo
    };
    let fileListName: any = '';
    let filePath = '';
    const isExistsFile = await fileSysExistsFile(fileSysExistsFileParms);
    if (isExistsFile.data === "NoFile") {
        const fileSearchApiPram = `directoryPath=${imageDriveRootPath}\\${slotId}&searchString=${barcodeNo}`
        try {
            const response: any = await fileSearchApi(fileSearchApiPram);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                fileListName = response.data[0].split('.')[0];
            }
        } catch (error) {
            console.error('Error fetching file list:', error);
        }
        filePath = `${imageDriveRootPath}\\${slotId}`;
    } else {
        fileListName = barcodeNo;
        filePath = cbcFilePathSetArr
    }
    const readFileTxtRes: any = await readFileEUCKR(`path=${filePath}&filename=${fileListName}`);

    if (readFileTxtRes.data.success) {
        const msg: any = await readH7File(readFileTxtRes.data.data);
        let cbcPatientNm = '';
        for (const cbcSegment of msg?.data?.segments) {
            if (cbcSegment.name.trim() === 'PID') {
                cbcPatientNm = cbcSegment.fields[4].value[0][0].value[0] || '';
                break;
            }
        }

        return { cbcPatientNm };
    } else {
        console.error(readFileTxtRes.data.message);
    }
}