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
          <input class="loginInput" type="text" v-model="password">
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
    const result = await login(user);
    if (result) {
      alert('login successful.');
      await router.push('/');
    }

  } catch (e) {
    alert('Login failed.')
    console.log(e);
  }
}
</script>
