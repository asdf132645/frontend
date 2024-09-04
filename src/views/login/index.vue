<template>
  <div class="loaderBackgroundForLogin" v-if="forceViewer === 'main' && !isViewer && !isTcpConnected">
    <div class="loaderForLogin"></div>
    <p class="loadingTextLogin">Loading...</p>
  </div>
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
import { getCurrentInstance, ref, onMounted, computed } from "vue";
import { login } from "@/common/api/service/user/userApi";
import { getDeviceIpApi } from "@/common/api/service/device/deviceApi";
import router from "@/router";
import { UserResponse  } from '@/common/api/service/user/dto/userDto'
import {ApiResponse} from "@/common/api/httpClient";
import {useStore} from "vuex";
import Alert from "@/components/commonUi/Alert.vue";
import { initializeAllSettings } from "@/common/lib/commonfunction/settingFunctions";

// 스토어
const store = useStore();
const password = ref('');
const idVal = ref('');
const instance = getCurrentInstance();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const isAutoLoginEnabled = ref(false);
const isTcpConnected = computed(() => store.state.commonModule.isTcpConnected);
const isViewer = ref(false);
const forceViewer = ref('');

//
onMounted(async () => {
  forceViewer.value = window.FORCE_VIEWER;
  await checkIsViewer()
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
    const result: ApiResponse<UserResponse | undefined | any> = await login(user);
    if (result?.data?.user) {

      await initializeAllSettings();
      await store.dispatch('userModule/setUserAction', result.data?.user);
      sessionStorage.setItem('user', JSON.stringify(result.data.user));

      if (isAutoLoginEnabled.value) {
        localStorage.setItem('user', JSON.stringify((result.data.user)))
      }
      await getIpAddress(result?.data?.user.userId);

    }else{
      showSuccessAlert('Login failed.');
    }
  } catch (e) {
    showSuccessAlert('server Err.')
    console.log(e);
  }
}

const checkIsViewer = async () => {
  try {
    const result = await getDeviceIpApi();
    if((result.data === '1' || (window.APP_API_BASE_URL && window.APP_API_BASE_URL.includes(result.data)))) {
      isViewer.value = false;
    } else {
      isViewer.value = true;
    }
  } catch (e) {
    console.log(e);
  }
}

const getIpAddress = async (userId: string) => {
  try {
    const result = await getDeviceIpApi();
    if((result.data === '1' || (window.APP_API_BASE_URL && window.APP_API_BASE_URL.includes(result.data))) && window.FORCE_VIEWER !== 'viewer'){
      await store.dispatch('commonModule/setCommonInfo', {viewerCheck: 'main'});
      await updateAccount('main');
      sessionStorage.setItem('viewerCheck', 'main');
      sessionStorage.setItem('pcIp', JSON.stringify(result.data));
    }else{
      await store.dispatch('commonModule/setCommonInfo', {viewerCheck: 'viewer'});
      await updateAccount('viewer');
      sessionStorage.setItem('viewerCheck', 'viewer');
      sessionStorage.setItem('pcIp', JSON.stringify(result.data));
    }
  } catch (e) {
    console.log(e);
  }
}

const updateAccount = async (viewerCheck: string) => {
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

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};

</script>
