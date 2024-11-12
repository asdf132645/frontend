<template>
  <div>
    <div v-if="isToggle">
      <div class="crcWrap flex-column-align-center">
        <div class="w30p">
          <div v-if="isUserAdminType(userType)" class="flex-align-center-justify-between mb10">
            <span>CRC Password</span>
            <input style="width: 100px;" type="text" placeholder="password" v-model="crcPassWord"/>
          </div>
        </div>

        <div v-if="isMasterId(masterId)" class="w30p">
          <div class="flex-align-center-justify-between mb20">
            <span>CRC Default Mode</span>
            <font-awesome-icon :icon="crcDefaultMode ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']" class="iconSize" @click="crcDefaultModeOn" />
          </div>

          <div class="flex-align-center-justify-between mb20">
            <span>CRC LIS Two Mode</span>
            <font-awesome-icon :icon="lisTwoMode ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']" class="iconSize" @click="lisTwoModeOn" />
          </div>

          <div class="flex-align-center-justify-between mb20">
            <span>CRC Connect</span>
            <font-awesome-icon :icon="crcConnect ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']" class="iconSize" @click="crcConnectOn" />
          </div>

          <div class="flex-column-align-center mt10">
            <span>CRC Remark Select Count</span>
            <div class="flex-center mt10" style="gap: 14px;">
              <label for="crc-remark">Remark</label>
              <input id="crc-remark" type="checkbox" @change="changeCrcRemarkCount" value="0" :checked="crcRemarkCountArr[0].checked"/>

              <label for="crc-comment">Comment</label>
              <input id="crc-comment" type="checkbox" @change="changeCrcRemarkCount" value="1" :checked="crcRemarkCountArr[1].checked"/>

              <label for="crc-recommendation">Recommendation</label>
              <input id="crc-recommendation" type="checkbox" @change="changeCrcRemarkCount" value="2" :checked="crcRemarkCountArr[2].checked"/>
            </div>

          </div>
        </div>
        <ul class="mt30" v-if="isMasterId(masterId)">
          <li>
            <p>crcTitle</p>
            <span><input type="text" placeholder="crcTitle" v-model="crcTitle"></span>
          </li>
          <li>
            <p>crcType</p>
            <span>
              <select v-model="crcType">
                <option value="select">select</option>
                <option value="text">text</option>
                <option value="percent">percent</option>
              </select>
            </span>
          </li>
          <li>
            <p>CRC Content</p>
            <span><input type="text" placeholder="crcContent" v-model="crcContent"></span>
          </li>
          <li v-if="crcType === 'percent'">
            <p>CRC PercentText</p>
            <span><input type="text" placeholder="crcPercentText" v-model="crcPercentText"></span>
          </li>
          <li>
            <p>Morphology Type</p>
            <span>
              <select v-model="morphologyType">
                <option value="RBC">RBC</option>
                <option value="WBC">WBC</option>
                <option value="PLT">PLT</option>
              </select>
            </span>
          </li>
          <li>
            <button class="crcWrapBtn" @click="addCrcArr">Add</button>
          </li>
        </ul>

      </div>


      <crc-compontent
          :items="crcArr"
          @updateCrc="onUpdateCrc"
          @deleteCrc="onDeleteCrc"
          moType="RBC"
          pageName="set"
          :masterId="masterId"
          :userType="userType"
      ></crc-compontent>

      <div class="moDivBox mt20">
        <div>
          <crc-compontent
              :items="crcArr"
              @updateCrc="onUpdateCrc"
              @deleteCrc="onDeleteCrc"
              moType="WBC"
              pageName="set"
              :masterId="masterId"
              :userType="userType"
          ></crc-compontent>
        </div>

        <div>
          <crc-compontent
              :items="crcArr"
              @updateCrc="onUpdateCrc"
              @deleteCrc="onDeleteCrc"
              moType="PLT"
              pageName="set"
              :masterId="masterId"
              :userType="userType"
          ></crc-compontent>
        </div>
      </div>
    </div>
  </div>
  <div class="mt10">
    <button class="saveBtn" type="button" @click="saveCrcData">Save</button>
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
import {ref, onMounted, computed, nextTick} from "vue";
import {
  crcGet, crcOptionGet,
  createCrcApi,
  createCrcOptionApi,
  deleteCrcApi,
  updateCrcApi, updateCrcOptionApi
} from "@/common/api/service/setting/settingApi";
import CrcCompontent from "@/components/commonUi/crcCompontent.vue";
import Alert from "@/components/commonUi/Alert.vue";
import {useStore} from "vuex";
import {MASTER_ID} from "@/common/defines/constFile/settings";
import {isAdmin, isMasterId, isUserAdminType} from "@/common/lib/utils/validators";

const isToggle = ref(false);
const crcTitle = ref('');
const crcType = ref('');
const crcPercentText = ref('');
const crcContent = ref('');
const crcArr = ref<any>([]);
const morphologyType = ref('');
const crcData = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const crcDefaultMode = ref(false);
const lisTwoMode = ref(false);
const crcConnect = ref(false);
const crcOptionPutWhether = ref(false);
const crcOptionId = ref(0);
const crcRemarkCountArr = ref<any[]>([{"checked": false, "name": "remark"}, {
  "checked": false,
  "name": "Comment"
}, {"checked": false, "name": "Recommendation"}]);
const crcPassWord = ref('');
const store = useStore();
const masterId = computed(() => store.state.userModule.userId);
const userType = computed(() => store.state.userModule.userType);

onMounted(async () => {
  await nextTick()
  crcData.value = await crcGet();
  const crcOptionApi = await crcOptionGet();

  if (crcOptionApi.data.length !== 0) {
    crcDefaultMode.value = crcOptionApi.data[0].crcMode;
    lisTwoMode.value = crcOptionApi.data[0]?.lisTwoMode;
    crcConnect.value = crcOptionApi.data[0].crcConnect;
    crcOptionId.value = crcOptionApi.data[0].id;
    crcRemarkCountArr.value = crcOptionApi.data[0].crcRemarkCount;
    crcPassWord.value = crcOptionApi.data[0].crcPassWord;
    crcOptionPutWhether.value = true;
  }else{
    crcRemarkCountArr.value = [{"checked": false, "name": "remark"}, {
      "checked": false,
      "name": "Comment"
    }, {"checked": false, "name": "Recommendation"}]
  }

  isToggle.value = true;
  if (isToggle.value) {
    crcArr.value = [];
    crcArr.value = JSON.parse(JSON.stringify(crcData.value.data));

  }
});
const nameChange = (name: string) => {
  switch (name) {
    case '0' :
      return 'remark';
    case '1':
      return 'Comment';
    case '2':
      return 'Recommendation';
  }
}

const changeCrcRemarkCount = (eve: Event) => {
  const countId = crcRemarkCountArr.value.findIndex((item) => {
    return item.name === nameChange(eve.target?.value)
  })
  crcRemarkCountArr.value[countId].checked = eve.target?.checked;
  // console.log(JSON.stringify(crcRemarkCountArr.value))
}

const hideAlert = () => {
  showAlert.value = false;
};
const showSuccessAlert = async (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
  window.scrollTo({top: 0, behavior: 'smooth'});
};
const addCrcArr = () => {
  if (crcTitle.value === '' || crcType.value === '') {
    return;
  }
  crcArr.value.push({
    crcTitle: crcTitle.value,
    crcType: crcType.value,
    crcPercentText: crcPercentText.value,
    morphologyType: morphologyType.value,
    crcContent: crcContent.value,
  });
};

// 업데이트 이벤트 처리 함수
const onUpdateCrc = async ({index, updatedItem}: { index: number, updatedItem: any }) => {
  crcArr.value[index] = updatedItem;
  await updateCrcApi(crcArr.value); // 서버로 업데이트 요청
};

// 삭제 이벤트 처리 함수
const onDeleteCrc = async ({index, id}: { index: number, id: any }) => {
  const findId = crcArr.value.findIndex((item: any) => item.id === id);
  crcArr.value.splice(findId, 1); // 배열에서 제거
  await deleteCrcApi({id}); // 서버에 삭제 요청
};

// 데이터 저장 함수
const saveCrcData = async () => {
  if(isMasterId(masterId.value)){
    if (crcOptionPutWhether.value && crcData.value.data.length !== 0) {
      await updateCrcApi(crcArr.value);
      await updateCrcOptionApi({
        id: crcOptionId.value,
        crcMode: crcDefaultMode.value,
        crcConnect: crcConnect.value,
        crcRemarkCount: crcRemarkCountArr.value,
        crcPassWord: crcPassWord.value,
        lisTwoMode: lisTwoMode.value
      });
    } else {
      await createCrcApi(crcArr.value);
      await createCrcOptionApi({
        crcMode: crcDefaultMode.value,
        crcConnect: crcConnect.value,
        crcRemarkCount: crcRemarkCountArr.value,
        crcPassWord: crcPassWord.value,
        lisTwoMode: lisTwoMode.value
      });

    }
  }else{
    if (crcOptionPutWhether.value && crcData.value.data.length !== 0) {
      await updateCrcApi(crcArr.value);
      await updateCrcOptionApi({
        id: crcOptionId.value,
        crcPassWord: crcPassWord.value,
      });
    }
  }

  await showSuccessAlert('Success');
};

const crcDefaultModeOn = () => {
  crcDefaultMode.value = !crcDefaultMode.value;
}
const lisTwoModeOn = () => {
  lisTwoMode.value = !lisTwoMode.value;
}

const crcConnectOn = () => {
  crcConnect.value = !crcConnect.value;
}
</script>
