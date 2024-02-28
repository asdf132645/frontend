<template>
  <div>
    <h3>Classification List</h3>
    <div class='listBoxTable'>
      <div class="filterListDiv">
        <div>
          <select v-model="searchType">
            <option value="barcodeNo">Barcode No</option>
            <option value="patientId">Patient ID</option>
            <option value="patientNm">Patient Name</option>
          </select>
          <input type="text" v-model='searchText'/>
          <Datepicker v-model="startDate"></Datepicker>
          <Datepicker v-model="endDate"></Datepicker>
          <button @click="search">Search</button>
        </div>
        <div>
          <span>Class Filter</span>
          <div>
            <span>NR count</span>
            <input type="text"/>
          </div>
          <div>
            <span>WBC Total</span>
            <select>
              <option>DESC</option>
              <option>ASC</option>
            </select>
          </div>
          <div>
            <ul>
              <li></li>
            </ul>
          </div>
          <div>
            <label><input type="checkbox"/> Diff</label>
            <label><input type="checkbox"/> PBS</label>
          </div>
        </div>
      </div>
      <ListTable :dbData="dbGetData" @loadMoreData="loadMoreData"/>
    </div>
    <div class='listBox'>
      <ListInfo :dbData="dbGetData"/>
      <ListWbcImg :dbData="dbGetData"/>
    </div>
  </div>
</template>

<script setup lang="ts">

import ListTable from "@/views/datebase/commponent/list/listTable.vue";
import ListInfo from "@/views/datebase/commponent/list/listInfo.vue";
import ListWbcImg from "@/views/datebase/commponent/list/listWbcImg.vue";
import {onMounted, ref} from "vue";
import {getRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {RuningInfo} from "@/common/api/service/runningInfo/dto/runningInfoDto";
import Datepicker from "vue3-datepicker";
import {formatDate} from "@/common/lib/utils/dateUtils";

const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const dbGetData = ref<RuningInfo[]>([]);
const emits = defineEmits();


const startDate = ref(new Date());
const endDate = ref(new Date());
const searchText = ref('');
const searchType = ref('barcodeNo');
const page = ref(1);

onMounted(async () => {
  userId.value = getStoredUser.id;
  await getDbData();
});

const getDbData = async () => {
  try {
    const result = await getRunningApi({
      page: page.value,
      pageSize: 25,
      startDay: formatDate(startDate.value),
      endDay: formatDate(endDate.value),
      barcodeNo: searchType.value === 'barcodeNo' ? searchText.value : undefined,
      patientId: searchType.value === 'patientId' ? searchText.value : undefined,
      patientNm: searchType.value === 'patientNm' ? searchText.value : undefined,
    });

    if (result && result.data) {
      const newData = result.data.data;

      if (newData.length === 0) {
        page.value -= 1;
      } else {
        dbGetData.value = [...dbGetData.value, ...newData];
      }
    }
  } catch (e) {
    console.error(e);
  }

};

const search = () => {
  getDbData();
};

const loadMoreData = async () => {
  page.value += 1;
  await getDbData();
};

</script>
