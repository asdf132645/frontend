<template>
  <table class='defaultTable mt2 dbDataTable'>
    <thead>
    <tr>
      <th>NO</th>
      <th>
        <input type="checkbox" v-model="selectAllCheckbox" @change="selectAllItems"/>
      </th>
      <th>Type</th>
      <th>State</th>
      <th>Tray Slot</th>
      <th>Barcode NO</th>
      <th>Patient ID</th>
      <th>Patient Name</th>
      <th>Analyzed Date</th>
      <th>Tact Time(S)</th>
      <th>Submit</th>
      <th>Submit Date</th>
      <th>Edit</th>
    </tr>
    </thead>
    <colgroup>
      <col width="3%"/>
      <col width="3%"/>
      <col width="3%"/>
      <col width="3%"/>
      <col width="3%"/>
      <col width="3%"/>
      <col width="3%"/>
      <col width="3%"/>
      <col width="15%"/>
      <col width="3%"/>
      <col width="3%"/>
      <col width="15%"/>
      <col width="3%"/>
    </colgroup>
    <tbody v-if="dbData.length !== 0">
    <template v-for="(item, idx) in dbData"
              :key="item.id">
      <tr :class="{ selectedTr: selectedItemId === item.id, submittedTr: item.submit === 'Submit', rock: item.state }"
          @click="selectItem(item)"
          @dblclick='rowDbClick(item)'
          ref="firstRow"
          style="height: 49px"
          v-bind:data-row-id="item.id"
          @contextmenu.prevent="rowRightClick(item, $event)"
      >
        <td> {{ idx + 1 }}</td>
        <td>
          <input type="checkbox" v-model="item.checked" @change="handleCheckboxChange(item)" :checked="item.checked"/>
        </td>
        <td> {{ projectType !== 'bm' ? getTestTypeText(item?.testType) : getBmTestTypeText(item?.testType) }}</td>
        <td>
          <font-awesome-icon
              :icon="['fas', `${!item?.state ? 'lock-open' : 'lock' }`]"
          />
        </td>
        <td> {{ item?.traySlot }}</td>
        <td> {{ item?.barcodeNo }}</td>
        <td> {{ item?.patientId }}</td>
        <td> {{ item?.patientNm }}</td>
        <td> {{ item?.createDate === '' ? '' : formatDateString(item?.createDate) }}</td>
        <td> {{ item?.tactTime }}</td>
        <td> {{ item?.submit }}</td>
        <td> {{ item?.submitDate === '' ? '' : formatDateString(item?.submitDate) }}</td>
        <td>
          <font-awesome-icon v-if="item?.submit === 'Ready'" :icon="['fas', 'pen-to-square']" @click="editData(item)"/>
        </td>
      </tr>
    </template>
    <tr>
      <div ref="loadMoreRef" style="height: 10px;"></div>
    </tr>
    </tbody>
    <tbody v-else>
    <tr class="text-center">
      <td colspan="13"> NO Data</td>
    </tr>
    </tbody>
  </table>
  <div v-if="contextMenu.visible" :style="{ top: (contextMenu.y - 60) + 'px', left: contextMenu.x + 'px' }"
       class="context-menu">
    <ul>
      <li @click="printStart">Print</li>
      <li @click="classificationRowDbClick">Classification</li>
      <li @click="editOrderData">Edit order data</li>
      <li @click="deleteRow">Delete</li>
      <li>export XLSX</li>
    </ul>
  </div>
  <Modal v-if="visible" @update:closeLayer="closeLayer" @afterOpen="onModalOpen">
    <!-- 헤더 슬롯에 들어갈 내용 -->
    <template #header>
      <h2>Edit order data</h2>
    </template>

    <!-- 컨텐츠 슬롯에 들어갈 내용 -->
    <template #content>
      <div>
        <ul class="editOrder">
          <li>
            <span>PB/BF</span>
            <input type="text" v-model="itemObj.testType"/>
          </li>
          <li>
            <span>Tray Slot</span>
            <input type="text" readonly v-model="itemObj.traySlot"/>
          </li>
          <li>
            <span>BARCODE ID</span>
            <input type="text" v-model="itemObj.barcodeNo" placeholder="BARCODE ID"/>
          </li>
          <li>
            <span>PATIENT ID</span>
            <input type="text" v-model="itemObj.patientId" placeholder="PATIENT ID"/>
          </li>
          <li>
            <span>PATIENT NAME</span>
            <input type="text" v-model="itemObj.patientNm" placeholder="PATIENT NAME"/>
          </li>
          <li>
            <span>Analyzed date</span>
            <input type="text" v-model="itemObj.analyzedDttm" readonly/>
          </li>
          <li>
            <span>Signed state</span>
            <input type="text" v-model="itemObj.signedState" readonly/>
          </li>
          <li>
            <span>Barcode Image</span>
          </li>
        </ul>
      </div>
      <div class="modalBottom">
        <button @click="dbDataEditSet">Ok</button>
      </div>
    </template>
  </Modal>
  <Print v-if="printOnOff" :selectItems="rightClickItem" ref="printContent" :printOnOff="printOnOff"
         :selectItemWbc="selectItemWbc" @printClose="printClose"/>
  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />
</template>

<script setup>
import {getBmTestTypeText, getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {
  ref,
  onMounted,
  watchEffect,
  defineProps,
  defineEmits,
  computed,
  nextTick,
  onUnmounted,
  getCurrentInstance
} from 'vue';
import router from "@/router";
import Modal from "@/components/commonUi/modal.vue";
import {deleteRunningApi, updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {messages} from "@/common/defines/constFile/constantMessageText";
import Print from "@/views/datebase/commponent/detail/report/print.vue";
import {getRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import {getUserIpApi} from "@/common/api/service/user/userApi";
import {stateUpdateCommon} from "@/common/lib/commonfunction";
import moment from "moment";
import {basicBmClassList, basicWbcArr} from "@/common/defines/constFile/classArr";


const props = defineProps(['dbData']);
const loadMoreRef = ref(null);
const emits = defineEmits();
const selectedItemId = ref('');
const visible = ref(false);
const itemObj = ref({});
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const commonDataGet = computed(() => store.state.commonModule);
const projectType = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

const formatDateString = (dateString) => {
  const momentObj = moment(dateString, 'YYYYMMDDHHmmssSSSSS');
  return momentObj.format('YYYY-MM-DD HH:mm:ss');
}


const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0
});
const rbcDegreeStandard = ref([]);
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const rightClickItem = ref({});
const printOnOff = ref(false);
const printContent = ref(null);
const selectItemWbc = ref([]);
const selectAllCheckbox = ref(false);
const instance = getCurrentInstance();


onMounted(async () => {
  projectType.value = process.env.PROJECT_TYPE;
  try {

    userId.value = getStoredUser.id;
    await getRbcDegreeData();
  } catch (e) {
    console.log(e);
  }
  document.addEventListener('click', handleOutsideClick);
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});
watchEffect(async () => {
  if (props.dbData.length > 0) {
    await nextTick();
    // 첫 번째 행을 클릭
    const dbBaseTrClickId = sessionStorage.getItem('dbBaseTrClickId') || 0;
    const filteredItems = props.dbData.filter(item => item.id === Number(dbBaseTrClickId));
    selectItem(filteredItems[0]);
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    });
    if (loadMoreRef.value) {
      observer.observe(loadMoreRef.value);
    }
  }
});


const printClose = () => {
  printOnOff.value = false;
}

const printStart = () => {
  printOnOff.value = true;
  resetContextMenu();
}
const editOrderData = () => {
  editData(rightClickItem.value);
  resetContextMenu();
};

const classificationRowDbClick = () => {
  rowDbClick(rightClickItem.value);
  resetContextMenu();
}
const selectAllItems = () => {
  props.dbData.forEach(item => {
    item.checked = selectAllCheckbox.value;
  });
};

const resetContextMenu = () => {
  contextMenu.value.x = 0;
  contextMenu.value.y = 0;
  contextMenu.value.visible = false;
}

const handleOutsideClick = (event) => {
  const contextMenuElement = document.querySelector('.context-menu');
  if (contextMenuElement && !contextMenuElement.contains(event.target)) {
    resetContextMenu();
  }
};


const rowRightClick = (item, event) => {
  if (props.dbData.filter(item => item.checked).length === 0) {
    showSuccessAlert(messages.IDS_ERROR_SELECT_A_TARGET_ITEM);
    return;
  }
  rightClickItem.value = item;
  if(Object.keys(item?.wbcInfo).length !== 0){
    const wbcInfoData = item?.wbcInfo?.wbcInfo[0];
    const sortedArray = wbcInfoData.sort((a, b) => a.id - b.id);
    selectItemWbc.value = sortedArray;
  }
  if (event) {
    contextMenu.value.x = event.clientX;
    contextMenu.value.y = event.clientY;
    contextMenu.value.visible = true;
  }
  // console.log('우클릭된 아이템:', props.dbData.filter(item => item.checked).length);
};

const handleCheckboxChange = (item) => {
  if (!item.hasOwnProperty('checked')) { // 체크드 하는 부분이 없으면 넣어줘야 갱신 가능
    item.checked = false;
  }
};


const handleIntersection = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio !== 1) {
      emits('loadMoreData');
    }
  });
};

const showSuccessAlert = (message) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};


const selectItem = (item) => {
  // 부모로 전달
  if (!item) {
    return;
  }
  emits('selectItem', item);
  selectedItemId.value = item.id;
  sessionStorage.setItem('dbBaseTrClickId', item.id);

  // 선택된 행이 화면에 보이도록 스크롤 조정
  const selectedRow = document.querySelector(`[data-row-id="${item.id}"]`);
  if (selectedRow) {
    selectedRow.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
};
const getUserIp = async (item) => {
  try {
    const result = await getUserIpApi();
    await stateUpdateCommon(item, result.data, [...props.dbData], userModuleDataGet.value.id).then(response => {
      emits('initData');
      instance?.appContext.config.globalProperties.$socket.emit('state', {
        type: 'SEND_DATA',
        payload: 'refreshDb'
      });
    }).catch(error => {
      console.error('Error:', error.response.data);
    });
  } catch (e) {
    console.log(e)
  }
}
const rowDbClick = async (item) => {
  if (item.state) {
    return;
  }

  let wbcInfoData = [];
  if(Object.keys(item?.wbcInfo).length === 0){
    wbcInfoData = projectType.value !== 'bm' ? basicWbcArr : basicBmClassList;
    item.wbcInfo = projectType.value !== 'bm' ? {wbcInfo: [basicWbcArr]} : {wbcInfo:[basicBmClassList]};
  }else{
    wbcInfoData = item?.wbcInfo?.wbcInfo[0];
  }
  const sortedArray = wbcInfoData.sort((a, b) => a.id - b.id);

  sessionStorage.setItem('selectItemRbc', JSON.stringify(item?.rbcInfo));
  sessionStorage.setItem('selectItemWbc', JSON.stringify(sortedArray));
  sessionStorage.setItem('selectItems', JSON.stringify(item));
  sessionStorage.setItem('originalDbData', JSON.stringify(props.dbData));
  await store.dispatch('commonModule/setCommonInfo', {clonedWbcInfo: item.wbcInfoAfter});
  await store.dispatch('commonModule/setCommonInfo', {clonedRbcInfo: item.rbcInfo});
  await getUserIp(item);
  await router.push('/databaseDetail');

}


const getRbcDegreeData = async () => {
  try {
    const result = await getRbcDegreeApi(String(userId.value));
    const data = result.data;
    rbcDegreeStandard.value = data?.categories
  } catch (e) {
    // console.log(e);
  }
};


const closeLayer = (val) => {
  visible.value = val;
};

const onModalOpen = () => {
  //
};

const dbDataEditSet = async () => {
  try {
    const updatedRuningInfo = {
      id: itemObj.value.id,
      barcodeNo: itemObj.value.barcodeNo,
      patientId: itemObj.value.patientId,
      patientNm: itemObj.value.patientNm,
    };

    const localDbData = [...props.dbData];

    const indexToUpdate = localDbData.findIndex(item => item.id === itemObj.value.id);

    if (indexToUpdate !== -1) {
      localDbData[indexToUpdate] = {...localDbData[indexToUpdate], ...updatedRuningInfo};
    }

    const response = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: [localDbData[indexToUpdate]]
    })
    if (response) {
      showSuccessAlert('success');
      emits('initData');
      closeLayer();
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const stateUpdate = async (itemVal, pcIp) => {
  try {
    const updatedRuningInfo = {
      id: itemVal.id,
      pcIp: pcIp,
      state: true,
    };

    const localDbData = [...props.dbData];

    const indexToUpdate = localDbData.findIndex(item => item.id === itemVal.id);

    if (indexToUpdate !== -1) {
      localDbData[indexToUpdate] = {...localDbData[indexToUpdate], ...updatedRuningInfo};
    }

    const response = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: [localDbData[indexToUpdate]]
    })
    if (response) {
      await emits('initData');
      await instance?.appContext.config.globalProperties.$socket.emit('state', {
        type: 'SEND_DATA',
        payload: 'refreshDb'
      });
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const editData = async (item) => {
  openLayer();
  itemObj.value = JSON.parse(JSON.stringify(item));
  itemObj.value.testType = projectType.value !== 'bm' ? getTestTypeText(item?.testType) : getBmTestTypeText(item?.testType)


}

const openLayer = () => {
  visible.value = true;
};

const deleteRow = async () => {
  try {
    const selectedItems = props.dbData.filter(item => item.checked);
    if (selectedItems.length === 0) {
      showSuccessAlert(messages.IDS_ERROR_SELECT_A_TARGET_ITEM);
      return;
    }

    const idsToDelete = selectedItems.map(item => item.id);
    const response = await deleteRunningApi(idsToDelete);

    if (response.success) {
      showSuccessAlert('Items deleted successfully');
      emits('refresh'); // 데이터 다시 불러오기
      resetContextMenu();
    } else {
      console.error('Failed to delete items');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


</script>

