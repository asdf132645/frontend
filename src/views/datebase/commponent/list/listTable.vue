<template>
  <table class='defaultTable mt2 dbDataTable'>
    <thead>
    <tr>
      <th>NO</th>
      <th><input type="checkbox"/></th>
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
      <col width="5%"/>
      <col width="5%"/>
      <col width="5%"/>
      <col width="5%"/>
      <col width="7%"/>
      <col width="8%"/>
      <col width="8%"/>
      <col width="8%"/>
      <col width="15%"/>
      <col width="7%"/>
      <col width="7%"/>
      <col width="20%"/>
      <col width="3%"/>
    </colgroup>
    <tbody v-if="dbData.length !== 0">
    <tr
        v-for="(item, idx) in dbData"
        :key="item.id"
        :class="{ selectedTr: selectedItemId === item.id, submittedTr: item.submit === 'Submit' }"
        @click="selectItem(item)"
        @dblclick='rowDbClick(item)'
        ref="firstRow"
        v-bind:data-row-id="item.id"
    >
      <td> {{ idx + 1 }}</td>
      <td>
        <input type="checkbox"/>
      </td>
      <td> {{ getTestTypeText(item?.testType) }}</td>
      <td>
        <font-awesome-icon
            :icon="['fas', `${!item?.state ? 'lock-open' : 'lock' }`]"
        />
      </td>
      <td> {{ item?.traySlot }}</td>
      <td> {{ item?.barcodeNo }}</td>
      <td> {{ item?.patientId }}</td>
      <td> {{ item?.patientNm }}</td>
      <td> {{ item?.analyzedDttm }}</td>
      <td> {{ item?.tactTime }}</td>
      <td> {{ item?.submit }}</td>
      <td> {{ item?.signedOfDate }}</td>
      <td>
        <font-awesome-icon v-if="item?.submit === 'Ready'" :icon="['fas', 'pen-to-square']"  @click="editData(item)"/>
      </td>
    </tr>
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
  <Modal v-if="visible" @update:closeLayer="closeLayer" @afterOpen="onModalOpen">
    <!-- 헤더 슬롯에 들어갈 내용 -->
    <template #header>
      <h2>Edit order data</h2>
    </template>

    <!-- 컨텐츠 슬롯에 들어갈 내용 -->
    <template #content>
      <div>
        <ul>
          <li>
            <span>PB/BF</span>
            <input type="text" v-model="itemObj.testType" readonly/>
          </li>
          <li>
            <span>Tray Slot</span>
            <input type="text" readonly v-model="itemObj.traySlot"/>
          </li>
          <li>
            <span>BARCODE ID</span>
            <input type="text" v-model="itemObj.barcodeNo"/>
          </li>
          <li>
            <span>PATIENT ID</span>
            <input type="text" v-model="itemObj.patientId"/>
          </li>
          <li>
            <span>PATIENT NAME</span>
            <input type="text" v-model="itemObj.patientNm"/>
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
        <button @click="dbDataSet">Ok</button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import {getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {ref, onMounted, watchEffect, defineProps, defineEmits, computed, nextTick} from 'vue';
import router from "@/router";
import Modal from "@/components/commonUi/modal.vue";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";

const props = defineProps(['dbData']);
const loadMoreRef = ref(null);
const emits = defineEmits();
const selectedItemId = ref('');
const visible = ref(false);
const itemObj = ref({});
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);

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
      threshold: 0.8,
    });
    if (loadMoreRef.value) {
      observer.observe(loadMoreRef.value);
    }
  }
});


const handleIntersection = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio !== 1) {
      emits('loadMoreData');
    }
  });
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
    selectedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

const rowDbClick = (item) => {
  const wbcInfoData = item?.wbcInfo?.wbcInfo[0];
  const sortedArray = wbcInfoData.sort((a, b) => a.id - b.id);
  // 스토어 사용 못하는 이유 -> 새로고침 등 여러가지 행동에 데이터가 날라가면 안되서 세션스토리지 사용
  sessionStorage.setItem('selectItemWbc', JSON.stringify(sortedArray));
  sessionStorage.setItem('selectItems', JSON.stringify(item));
  sessionStorage.setItem('originalDbData', JSON.stringify(props.dbData));
  router.push('/databaseWbc')
}

const closeLayer = (val) => {
  visible.value = val;
};

const onModalOpen = () => {
  //
};

const dbDataSet = async () => {
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
      alert('success');
      emits('initData');
      closeLayer();
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
  itemObj.value.testType = getTestTypeText(item?.testType);

}

const openLayer = () => {
  visible.value = true;
};
</script>

