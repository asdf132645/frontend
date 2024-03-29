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
</template>

<script setup lang="ts">
import {getCurrentInstance, ref} from "vue";
import {login} from "@/common/api/service/user/userApi";
import router from "@/router";
import { UserResponse  } from '@/common/api/service/user/dto/userDto'
import {ApiResponse} from "@/common/api/httpClient";
import {useStore} from "vuex";
import {useEventBus} from "@/eventBus/eventBus";
import {tcpReq} from "@/common/tcpRequest/tcpReq";
// 스토어
const store = useStore();
const password = ref('');
const idVal = ref('');
const instance = getCurrentInstance();

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
      alert('login successful.');
      await store.dispatch('userModule/setUserAction', result.data?.user);
      sessionStorage.setItem('user', JSON.stringify(result.data.user));
      await document.documentElement.requestFullscreen();
      await router.push('/');
      instance?.appContext.config.globalProperties.$socket.emit('message', {
        type: 'SEND_DATA',
        payload: tcpReq().embedStatus.sysInfo
      });
      await store.dispatch('commonModule/setCommonInfo', {resFlag: false});
    }else{
      alert('Login failed.');
    }
  } catch (e) {
    alert('server Err.')
    console.log(e);
  }
}
</script>
