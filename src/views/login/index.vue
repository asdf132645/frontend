<template>
  <div>
    <p>LOGIN</p>
    <span>Unique Idea Medical Device</span>
    <div>
      <ul>
        <li>
          <span class="loginTitle">ID</span>
          <input class="loginInput" type="text" v-model="idVal">
        </li>
        <li>
          <span class="loginTitle">password</span>
          <input class="loginInput" type="password" v-model="password">
        </li>
      </ul>
      <div>
        <input type="checkbox">
        <label>Save Login Profile</label>
      </div>
      <div class='loginBtn'>
        <button type="button" @click="loginUser">Login</button>
        <button type="button" @click="goJoinPage">Add User</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {login} from "@/common/api/service/user/userApi";
import router from "@/router";
import { UserResponse  } from '@/common/api/service/user/dto/userDto'
import {ApiResponse} from "@/common/api/httpClient";
import {useStore} from "vuex";
// 스토어
const store = useStore();
const password = ref('');
const idVal = ref('');

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
    if (result?.data && Object.keys(result.data).length) {
      alert('login successful.');
      await store.dispatch('userModule/setUserAction', result.data?.user);
      sessionStorage.setItem('user', JSON.stringify(result.data.user));
      document.documentElement.requestFullscreen();
      await router.push('/');
    }else{
      alert('Login failed');
    }

  } catch (e) {
    alert('Login failed.')
    console.log(e);
  }
}
</script>
