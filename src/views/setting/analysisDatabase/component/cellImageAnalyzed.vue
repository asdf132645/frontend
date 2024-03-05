<template>
  <div>
    <table class="settingTable">
      <tbody>
      <tr>
        <th>Analysis type</th>
        <td colspan="2">
          <select v-model='testTypeCd'>
            <option v-for="type in testTypeList" :key="type.value" :value="type.value">{{ type.text }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <th rowspan="4">WBC diff analysis values</th>
        <th>Cell analyzing count:</th>
        <td>
          <select v-model='pbAnalysisType'>
            <option v-for="type in AnalysisList" :key="type.value" :value="type.value">{{ type.text }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <th>Wbc Position margin:</th>
        <td>
          <select v-model='wbcPositionMargin'>
            <option v-for="type in WbcPositionMarginList" :key="type.value" :value="type.value">{{ type.text }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <th>Rbc Position margin:</th>
        <td>
          <select v-model='rbcPositionMargin'>
            <option v-for="type in PositionMarginList" :key="type.value" :value="type.value">{{ type.text }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <th>Plt Position margin:</th>
        <td>
          <select v-model='pltPositionMargin'>
            <option v-for="type in PositionMarginList" :key="type.value" :value="type.value">{{ type.text }}</option>
          </select>
        </td>
      </tr>
      <!--      PBS analysis values-->
      <tr>
        <th rowspan="2">PBS analysis values</th>
        <th>
          Cell analyzing count:
        </th>
        <td>
          <select v-model='pbAnalysisType2'>
            <option v-for="type in AnalysisList" :key="type.value" :value="type.value">{{ type.text }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <th>Stitch count:</th>
        <td>
          <select v-model='stitchCount'>
            <option v-for="type in stitchCountList" :key="type.value" :value="type.value">{{ type.text }}</option>
          </select>
        </td>
      </tr>
      <!--      BF analysis values-->
      <tr>
        <th>BF analysis values</th>
        <th>Cell analyzing count:</th>
        <td>
          <select v-model='bfAnalysisType'>
            <option v-for="type in AnalysisList" :key="type.value" :value="type.value">{{ type.text }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <th>IA root path</th>
        <td colspan="2">
          <select v-model='pbiaRootPath'>
            <option v-for="type in drive" :key="type" :value="type">{{ type }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <th>NS/NB Integration</th>
        <td>
          <font-awesome-icon
              :icon="isNsNbIntegration ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
              @click="toggleNsNbIntegration"
          />
        </td>
      </tr>
      <tr>
        <th>Alarm Timer (sec)</th>
        <td>
          <font-awesome-icon
              :icon="isAlarm ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
              @click="toggleAlarm"
          />
        </td>
        <td>
          <input type="text" v-model='alarmCount'>
        </td>
      </tr>
      <tr>
        <th>keepPage</th>
        <td>
          <font-awesome-icon
              :icon="keepPage ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
              @click="toggleKeepPage"
          />
        </td>
      </tr>
      </tbody>
    </table>

    <div>
      <h5>Backup and Restore</h5>
      <div>
        <input type="text" readonly v-model='backupPath'>
        <Datepicker v-model="backupStartDate"></Datepicker>
        <Datepicker v-model="backupEndDate"></Datepicker>
      </div>
    </div>
    <button type="button" @click='cellImgSet()'>Save Cell image analyzed</button>
  </div>
  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />
</template>

<script setup lang="ts">
import {createCellImgApi, getCellImgApi, getDrivesApi, putCellImgApi} from "@/common/api/service/setting/settingApi";
import Datepicker from 'vue3-datepicker';

import router from "@/router";
import {onMounted, ref} from "vue";
import {
  AnalysisList,
  PositionMarginList, stitchCountList,
  testTypeList,
  WbcPositionMarginList
} from "@/common/defines/constFile/settings";
import Alert from "@/components/commonUi/Alert.vue";
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');


const testTypeCd = ref('01');
const pbAnalysisType = ref('100');
const wbcPositionMargin = ref('0');
const rbcPositionMargin = ref('0');
const pltPositionMargin = ref('0');
const pbAnalysisType2 = ref('100');
const stitchCount = ref('1');
const bfAnalysisType = ref('100');
const pbiaRootPath = ref('');
const isNsNbIntegration = ref(false);
const isAlarm = ref(false);
const alarmCount = ref('0');
const keepPage = ref(false);
const backupPath = ref('');
const backupStartDate = ref(new Date());
const backupEndDate = ref(new Date());
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const saveHttpType = ref('');
const drive = ref<any>([]);

onMounted(async () => {
  userId.value = getStoredUser.id;
  await cellImgGet();
  await driveGet();
});

const driveGet = async () => {
  try {
    const result = await getDrivesApi();
    if (result) {
      if (!result?.data) {
      } else {
        const data = result.data;
        for (const dataKey in data) {
          data[dataKey] = data[dataKey] + '\\ia_proc';
        }
        drive.value = data;

      }
      console.log(result)

    }

  } catch (e) {

    console.log(e);
  }
}

const cellImgGet = async () => {
  try {
    const result = await getCellImgApi(String(userId.value));
    if (result) {
      if (!result?.data) {
        console.log(null)
        saveHttpType.value = 'post';
      } else {
        saveHttpType.value = 'put';

        const data = result.data;

        testTypeCd.value = data.analysisType;
        pbAnalysisType.value = data.cellAnalyzingCount;
        wbcPositionMargin.value = data.wbcPositionMargin;
        rbcPositionMargin.value = data.rbcPositionMargin;
        pltPositionMargin.value = data.pltPositionMargin;
        pbAnalysisType2.value = data.pbAnalysisType2;
        stitchCount.value = data.stitchCount;
        bfAnalysisType.value = data.bfAnalysisType;
        pbiaRootPath.value = data.pbiaRootPath
        isNsNbIntegration.value = data.isNsNbIntegration;
        isAlarm.value = data.isAlarm;
        alarmCount.value = data.alarmCount;
        keepPage.value = data.keepPage;
        backupPath.value = data.backupPath;
        backupStartDate.value = new Date(data.backupStartDate);
        backupEndDate.value = new Date(data.backupEndDate);

      }
      console.log(result)

    }

  } catch (e) {

    console.log(e);
  }
}

const cellImgSet = async () => {

  const cellImgSet = {
    analysisType: testTypeCd.value,
    cellAnalyzingCount: pbAnalysisType.value,
    wbcPositionMargin: wbcPositionMargin.value,
    rbcPositionMargin: rbcPositionMargin.value,
    pltPositionMargin: pltPositionMargin.value,
    pbAnalysisType2: pbAnalysisType2.value,
    stitchCount: stitchCount.value,
    bfAnalysisType: bfAnalysisType.value,
    pbiaRootPath: pbiaRootPath.value,
    isNsNbIntegration: isNsNbIntegration.value,
    isAlarm: isAlarm.value,
    alarmCount: alarmCount.value,
    keepPage: keepPage.value,
    backupPath: backupPath.value,
    backupStartDate: backupStartDate.value.toISOString().split('T')[0],
    backupEndDate: backupEndDate.value.toISOString().split('T')[0],
    userId: String(userId.value),
  }

  try {
    let result = {};
    if (saveHttpType.value === 'post') {
      result = await createCellImgApi(cellImgSet);
    } else {
      result = await putCellImgApi(cellImgSet, userId.value);
    }

    if (result) {
      showSuccessAlert('save successful');
    }

  } catch (e) {

    console.log(e);
  }
}
const toggleNsNbIntegration = () => {
  isNsNbIntegration.value = !isNsNbIntegration.value;
};

const toggleAlarm = () => {
  isAlarm.value = !isAlarm.value;
};

const toggleKeepPage = () => {
  keepPage.value = !keepPage.value;
};

const handleFileChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  console.log(event)
  if (files && files.length > 0) {
    const folderPath = files[0].webkitRelativePath.split('/')[0];
    console.log('Folder Path:', files[0]);
  }
};

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};


</script>
