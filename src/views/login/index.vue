<template>
  <div class='uimdLogin'>
    <div class='loginContent'>
      <p class="loginTitle"><span class="loginColorSpan">U</span>IMD</p>
      <p class='loginP mt2'>Unique Idea Medical Device</p>
      <div class="mt3 loginDiv">
        <ul class="loginUl">
          <li>
            <input class="loginInput" type="text" v-model="idVal" placeholder="ID">
          </li>
          <li>
            <input class="loginInput" type="password" v-model="password" placeholder="password">
          </li>
        </ul>
<!-- 자동 로그인시 Fullscreen이 안되는 문제가 발생하여 보류 -->
<!--        <div class="mt1 loginFooter">-->
<!--          <input type="checkbox" id="checked" v-model="isAutoLoginEnabled">-->
<!--          <label class="loginLabel" for="checked">Save Login Profile</label>-->
<!--        </div>-->
        <div class='loginBtn'>
          <button type="button" @click="loginUser">Login</button>
          <button type="button" @click="goJoinPage">Add User</button>
        </div>
      </div>
    </div>
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
import {getCurrentInstance, ref, onMounted} from "vue";
import {getUserIpApi, login, putUserDataApi} from "@/common/api/service/user/userApi";
import router from "@/router";
import { UserResponse  } from '@/common/api/service/user/dto/userDto'
import {ApiResponse} from "@/common/api/httpClient";
import {useStore} from "vuex";
import Alert from "@/components/commonUi/Alert.vue";
import {
  firstCellImgSet,
  firstCreateRbcDegreeData,
  firstSaveNormalRange,
  firstSaveOrderClass
} from "@/common/lib/commonfunction/settingFunctions";

// 스토어
const store = useStore();
const password = ref('');
const idVal = ref('');
const instance = getCurrentInstance();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const isAutoLoginEnabled = ref(false);

onMounted(() => {
  isAutoLogginable();
})

/** 자동 로그인 확인 */
const isAutoLogginable = () => {
  const getStoredUser = JSON.parse(localStorage.getItem('user') || '{}');
  if (getStoredUser.userId && getStoredUser.password) {
    idVal.value = getStoredUser.userId;
    password.value = getStoredUser.password;
    loginUser();
  }
};


const goJoinPage = () => {
  router.push('/user/join');
}

const loginUser = async () => {
  const user = {
    userId: idVal.value,
    password: password.value,
  }

  if (user.userId === '' || user.password === '') {
    showSuccessAlert('Login failed.');
    return;
  }

  try {
    const result: ApiResponse<UserResponse | undefined> = await login(user);
    if (result?.data?.user) {
      await firstCellImgSet();
      await firstSaveOrderClass(String(result.data?.user.id));
      await firstSaveNormalRange(String(result.data?.user.id));
      await firstCreateRbcDegreeData(String(result.data?.user.id));
      await store.dispatch('userModule/setUserAction', result.data?.user);
      sessionStorage.setItem('user', JSON.stringify(result.data.user));

      if (isAutoLoginEnabled.value) {
        localStorage.setItem('user', JSON.stringify((result.data.user)))
      }
      await getUserIp(result?.data?.user.userId);

    }else{
      showSuccessAlert('Login failed.');
    }
  } catch (e) {
    showSuccessAlert('server Err.')
    console.log(e);
  }
}

const getUserIp = async (userId: string) => {
  try {
    const result = await getUserIpApi();
    if (result.data === '1' || (window.APP_API_BASE_URL && window.APP_API_BASE_URL.includes(result.data))) {
      await store.dispatch('commonModule/setCommonInfo', {viewerCheck: 'main'});
      await updateAccount(userId, String(result.data), 'main');
      sessionStorage.setItem('pcIp', JSON.stringify(result.data));

    }else{
      await store.dispatch('commonModule/setCommonInfo', {viewerCheck: 'viewer'});
      await updateAccount(userId, result.data, 'viewer');
      sessionStorage.setItem('pcIp', JSON.stringify(result.data));
    }
  } catch (e) {
    console.log(e);
  }
}

const updateAccount = async (userId: string, pcIp: string, viewerCheck: string) => {
  const user = {
    userId: userId,
    password: '',
    name: '',
    employeeNo: '',
    userType: '',
    subscriptionDate: '',
    state: '',
    pcIp: pcIp
  }

  try {
    const result = await putUserDataApi(user);
    if (result) {
      showSuccessAlert('login successful.');

      if(viewerCheck === 'main'){
        await router.push('/');
        await document.documentElement.requestFullscreen();
      }else{
        await router.push('/dataBase');
        await document.documentElement.requestFullscreen();
      }
      await store.dispatch('commonModule/setCommonInfo', {loginSetData: ''});
      await store.dispatch('commonModule/setCommonInfo', {resFlag: false});
    }

  } catch (e) {

    console.log(e);
  }
}

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};

</script>
