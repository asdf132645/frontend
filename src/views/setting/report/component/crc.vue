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

        <div v-if="isMasterId(masterId)" class="">
          <div class="flex-align-center-justify-between mb20">
            <span>CRC Default Mode</span>
            <font-awesome-icon :icon="crcDefaultMode ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']" class="iconSize"
                               @click="crcDefaultModeOn"/>
          </div>

          <div class="flex-align-center-justify-between mb20">
            <span>CRC LIS Two Mode</span>
            <font-awesome-icon :icon="lisTwoMode ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']" class="iconSize"
                               @click="lisTwoModeOn"/>
          </div>

          <div class="flex-align-center-justify-between mb20">
            <span>CRC Connect</span>
            <font-awesome-icon :icon="crcConnect ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']" class="iconSize"
                               @click="crcConnectOn"/>
          </div>

          <div class="flex-column-align-center mt10">
            <span>CRC Remark Select Count</span>
            <div class="flex-center mt10" style="gap: 14px;">
              <div class="flex-align-center">
<!--                <label class="crc-setting-title" for="crc-remark">{{ setCrcTitles(siteCd, remarkTxt) }}</label>-->
                <input class="crc-setting-title" v-model="remarkTxt"/>
                <input class="crc-setting-title-input" id="crc-remark" type="checkbox" @change="changeCrcRemarkCount"
                       value="0"
                       :checked="crcRemarkCountArr[0].checked"/>
              </div>

              <div class="flex-align-center">
<!--                <label class="crc-setting-title" for="crc-comment">{{ setCrcTitles(siteCd, commentTxt) }}</label>-->
                <input class="crc-setting-title" v-model="commentTxt"/>
                <input class="crc-setting-title-input" id="crc-comment" type="checkbox" @change="changeCrcRemarkCount"
                       value="1"
                       :checked="crcRemarkCountArr[1].checked"/>
              </div>

              <div class="flex-align-center">
<!--                <label class="crc-setting-title" for="crc-recommendation">{{-->
<!--                    setCrcTitles(siteCd, recommendationTxt)-->
<!--                  }}</label>-->
                <input class="crc-setting-title" v-model="recommendationTxt"/>
                <input class="crc-setting-title-input" id="crc-recommendation" type="checkbox"
                       @change="changeCrcRemarkCount" value="2"
                       :checked="crcRemarkCountArr[2].checked"/>
              </div>


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
import {isMasterId, isUserAdminType} from "@/common/lib/utils/validators";
import {scrollToTop} from "@/common/lib/utils/scroll";
import {setCrcTitles} from "../../../../common/helpers/crc/crcContent";
import Button from "@/components/commonUi/Button.vue";

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
const crcRemarkCountArr = ref<any[]>([{"checked": false, "name": "Remark"}, {
  "checked": false,
  "name": "Comment"
}, {"checked": false, "name": "Recommendation"}]);
const crcPassWord = ref('');
const store = useStore();
const masterId = computed(() => store.state.userModule.userId);
const userType = computed(() => store.state.userModule.userType);
const siteCd = computed(() => store.state.commonModule.siteCd);

const remarkTxt = ref('Remark');
const commentTxt = ref('Comment');
const recommendationTxt = ref('Recommendation');

onMounted(async () => {
  await nextTick()
  crcData.value = await crcGet();
  const crcOptionApi = await crcOptionGet();

  if (crcOptionApi.data.length !== 0) {
    const crcData = crcOptionApi.data[0];

    crcDefaultMode.value = crcData.crcMode;
    lisTwoMode.value = crcData?.lisTwoMode;
    crcConnect.value = crcData.crcConnect;
    crcOptionId.value = crcData.id;
    crcRemarkCountArr.value = crcData.crcRemarkCount;

    if (crcRemarkCountArr.value.length >= 3) {
      [remarkTxt.value, commentTxt.value, recommendationTxt.value] = crcRemarkCountArr.value.map(item => item.name);
    }


    const updatedItems = crcRemarkCountArr.value.map(item => {
      if (item.name === "remark") {
        return { ...item, name: "R" + item.name.slice(1) };
      }
      return item;
    });
    crcRemarkCountArr.value = updatedItems;
    crcPassWord.value = crcOptionApi.data[0].crcPassWord;
    crcOptionPutWhether.value = true;
  } else {
    crcRemarkCountArr.value = [
      {"checked": false, "name": remarkTxt.value},
      { "checked": false, "name": commentTxt.value},
      {"checked": false, "name": recommendationTxt.value}
    ]
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
      return 'Remark';
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
}

const hideAlert = () => {
  showAlert.value = false;
};
const showSuccessAlert = async (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
  scrollToTop();
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
  const crcOptionApi = await crcOptionGet();

  if (isMasterId(masterId.value)) {
    if (crcOptionPutWhether.value && crcOptionApi.data.length !== 0) {
      [remarkTxt.value, commentTxt.value, recommendationTxt.value].forEach((value, index) => {
        if (crcRemarkCountArr.value[index]) {
          crcRemarkCountArr.value[index].name = value;
        }
      });
      await updateCrcOptionApi({
        id: crcOptionId.value,
        crcMode: crcDefaultMode.value,
        crcConnect: crcConnect.value,
        crcRemarkCount: crcRemarkCountArr.value,
        crcPassWord: crcPassWord.value,
        lisTwoMode: lisTwoMode.value
      });
    } else {
      await createCrcOptionApi({
        crcMode: crcDefaultMode.value,
        crcConnect: crcConnect.value,
        crcRemarkCount: crcRemarkCountArr.value,
        crcPassWord: crcPassWord.value,
        lisTwoMode: lisTwoMode.value
      });
    }
    if (crcOptionPutWhether.value && crcData.value.data.length !== 0) {
      await updateCrcApi(crcArr.value);
    } else {
      await createCrcApi(crcArr.value);
    }
  } else {
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
