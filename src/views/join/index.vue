<template>
  <div class="joinContent">
    <p class="mt2 mb2">CREATE ACCOUNT</p>
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
        <button class="defaultBtn" type="button" @click='createAccount'>create account</button>
        <button class="defaultBtn" type="button" @click='goLoginPage'>login page</button>
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
import {ref} from "vue";
import {createUser, getUserIpApi} from "@/common/api/service/user/userApi";
import router from "@/router";
import Alert from "@/components/commonUi/Alert.vue";

const employeeNo = ref('');
const idVal = ref('');
const nameVal = ref('');
const passwordRepeat = ref('');
const password = ref('');
const userType = ref('admin');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

const goLoginPage = () => {
  router.push('/user/login');
}
const createAccount = async () => {
  const result = await getUserIpApi();
  const currentDate = new Date();
  const user = {
    userId: idVal.value,
    password: password.value,
    name: nameVal.value,
    employeeNo: employeeNo.value,
    userType: userType.value,
    subscriptionDate: currentDate,
    state: '',
    pcIp: result.data,
  }

  try {
    const result = await createUser(user);
    if (result) {
      await showSuccessAlert('registration successful');
      await router.push('/user/login');
    }

  } catch (e) {

    console.log(e);
  }
}
const showSuccessAlert = async (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};
const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};
</script>
