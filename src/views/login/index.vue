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
        <div class="mt1 loginFooter">
          <input type="checkbox">
          <label class="loginLabel">Save Login Profile</label>
        </div>
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
import {getCurrentInstance, ref} from "vue";
import {getUserApi, getUserIpApi, login, putUserDataApi} from "@/common/api/service/user/userApi";
import router from "@/router";
import { UserResponse  } from '@/common/api/service/user/dto/userDto'
import {ApiResponse} from "@/common/api/httpClient";
import {useStore} from "vuex";
import Alert from "@/components/commonUi/Alert.vue";
import {firstCellImgSet, firstSaveOrderClass} from "@/common/lib/commonfunction/settingFunctions";

// 스토어
const store = useStore();
const password = ref('');
const idVal = ref('');
const instance = getCurrentInstance();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');


const goJoinPage = () => {
  router.push('/user/join');
}

const loginUser = async () => {
  const user = {
    userId: idVal.value,
    password: password.value,
  }

  try {
    const result: ApiResponse<UserResponse | undefined> = await login(user);
    if (result?.data?.user) {
      await firstCellImgSet(String(result?.data?.user.id));
      await firstSaveOrderClass(String(result.data?.user.id));
      await store.dispatch('userModule/setUserAction', result.data?.user);
      sessionStorage.setItem('user', JSON.stringify(result.data.user));
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
    console.log('process.env.MAIN_API', process.env.MAIN_API === result.data)
    if(result.data === process.env.MAIN_API || result.data === '1'){
      await store.dispatch('commonModule/setCommonInfo', {viewerCheck: 'main'});
      await updateAccount(userId, String(process.env.MAIN_API), 'main');
    }else{
      await store.dispatch('commonModule/setCommonInfo', {viewerCheck: 'viewer'});
      await updateAccount(userId, result.data, 'viewer');
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
    pcIp: pcIp,
    viewerCheck: viewerCheck,
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
