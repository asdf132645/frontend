<template>
  <div class="joinContent">
    <p class="mt2 mb4 ">CREATE ACCOUNT</p>
    <div>
      <ul class="joinWrapper">
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
        <button class="defaultBtn" type="button" @click='createAccount'>Create Account</button>
        <button class="defaultBtn" type="button" @click='goLoginPage'>Back</button>
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
import {createUser} from "@/common/api/service/user/userApi";
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
  const currentDate = new Date();

  if (idVal.value === "") {
    await showErrorAlert('Please enter id');
    return;
  }
  else if (idVal.value.includes('_')) {
    await showErrorAlert('UserId is not available');
    return;
  }
  else if (password.value === "") {
    await showErrorAlert('Please enter password');
    return;
  }
  else if (nameVal.value === "") {
    await showErrorAlert('Please enter name');
    return;
  }
  else if (employeeNo.value === "") {
    await showErrorAlert('Please enter Employee No');
    return;
  }
  else if (passwordRepeat.value === "") {
    await showErrorAlert('Please enter repeat password');
    return;
  }
  else if (password.value !== passwordRepeat.value) {
    await showErrorAlert('Please check if the password and password are the same');
    return;
  }

  const user = {
    userId: idVal.value,
    password: password.value,
    name: nameVal.value,
    employeeNo: employeeNo.value,
    userType: userType.value,
    subscriptionDate: currentDate,
  }

  try {
    const result: any = await createUser(user);
    if (result.data?.userId) {
      await showSuccessAlert('registration successful');
      await router.push('/user/login');
    } else {

      // User Id 중복
      if (result.data.includes('Duplicate')) {
        await showErrorAlert('Duplicated user id');
      }

    }
  } catch (e) {
    console.log(e);
    await showErrorAlert('Signin fail');
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
