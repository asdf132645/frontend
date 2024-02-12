<template>
  <div>
    <p>CREATE ACCOUNT</p>
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
        <li>
          <span class="loginTitle">Repeat password</span>
          <input class="loginInput" type="text" v-model="passwordRepeat">
        </li>
        <li>
          <span class="loginTitle">name</span>
          <input class="loginInput" type="text" v-model="nameVal">
        </li>
        <li>
          <span class="loginTitle">Employee No</span>
          <input class="loginInput" type="text" v-model="employeeNo">
        </li>
        <li>
          <span class="loginTitle">user Type</span>
          <select v-model="userType">
            <option value="admin">Admin</option>
            <option value="normal">Normal</option>
          </select>
        </li>
      </ul>
      <div class='joinBtn'>
        <button type="button" @click='createAccount'>create account</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {createUser} from "@/common/api/service/user/userApi";
import router from "@/router";

const employeeNo = ref('');
const idVal = ref('');
const nameVal = ref('');
const passwordRepeat = ref('');
const password = ref('');
const userType = ref('');

const createAccount = async () => {
  const currentDate = new Date();
  const user = {
    userId: idVal.value,
    password: password.value,
    name: nameVal.value,
    employeeNo: employeeNo.value,
    userType: userType.value,
    subscriptionDate: currentDate,
    state: '',
  }

  try {
    const result = await createUser(user);
    if (result) {
      alert('registration successful');
      await router.push('/user/login');
    }

  } catch (e) {

    console.log(e);
  }
}

</script>
