<template>
  <div class="joinContent">
    <p class="mt20 mb40 ">CREATE ACCOUNT</p>
    <div>
      <ul class="joinWrapper">
        <li>
          <span class="loginTitle">ID</span>
          <input class="loginInput" type="text" v-model="idVal">
        </li>
        <li>
          <span class="loginTitle">Password</span>
          <input class="loginInput" type="text" v-model="password">
        </li>
        <li>
          <span class="loginTitle">Repeat password</span>
          <input class="loginInput" type="text" v-model="passwordRepeat">
        </li>
        <li>
          <span class="loginTitle">Name</span>
          <input class="loginInput" type="text" v-model="nameVal">
        </li>
        <li>
          <span class="loginTitle">Employee No</span>
          <input class="loginInput" type="text" v-model="employeeNo">
        </li>
        <li>
          <span class="loginTitle">User Type</span>
          <select class="loginInput" v-model="userType" disabled>
            <option value="admin">Admin</option>
            <option value="normal">Normal</option>
          </select>
        </li>
      </ul>
      <div class='joinBtn'>
        <Button @click="createAccount">
          Create Account
        </Button>
        <Button @click="goLoginPage">
          Back
        </Button>
      </div>
    </div>
  </div>

  <ToastNotification
      v-if="toastInfo.message"
      :message="toastInfo.message"
      :messageType="toastInfo.messageType"
      :duration="1500"
  />
</template>

<script setup lang="ts">
import {ref} from "vue";
import {createUser} from "@/common/api/service/user/userApi";
import router from "@/router";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {useToast} from "@/common/lib/utils/toast";
import {MESSAGES, MSG} from "@/common/defines/constants/constantMessageText";
import Button from "@/components/commonUi/Button.vue";

const employeeNo = ref('');
const idVal = ref('');
const nameVal = ref('');
const passwordRepeat = ref('');
const password = ref('');
const userType = ref('normal');
const { toastInfo, showToast } = useToast();

const goLoginPage = () => {
  router.push('/user/login');
}

const createAccount = async () => {
  const currentDate = new Date();

  if (idVal.value === "") {
    showToast(MSG.SIGNUP.ENTER_ID, MESSAGES.TOAST_MSG_ERROR);
    return;
  }
  else if (idVal.value.includes('_')) {
    showToast(MSG.SIGNUP.USER_ID_VAILD, MESSAGES.TOAST_MSG_ERROR);
    return;
  }
  else if (password.value === "") {
    showToast(MSG.SIGNUP.PWD, MESSAGES.TOAST_MSG_ERROR);
    return;
  }
  else if (nameVal.value === "") {
    showToast(MSG.SIGNUP.NAME, MESSAGES.TOAST_MSG_ERROR);
    return;
  }
  else if (employeeNo.value === "") {
    showToast(MSG.SIGNUP.EMPLOYEE_NO, MESSAGES.TOAST_MSG_ERROR);
    return;
  }
  else if (passwordRepeat.value === "") {
    showToast(MSG.SIGNUP.REPEAT_PWD, MESSAGES.TOAST_MSG_ERROR);
    return;
  }
  else if (password.value !== passwordRepeat.value) {
    showToast(MSG.SIGNUP.PWD_SAME, MESSAGES.TOAST_MSG_ERROR);
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
    const result = await createUser(user);
    if (result.data?.userId) {
      await router.push('/user/login');
    } else {

      // User Id 중복
      if (result.data.includes('Duplicate')) {
        showToast(MSG.SIGNUP.DUPLICATE_ID, MESSAGES.TOAST_MSG_ERROR);
      }

    }
  } catch (e) {
    console.error(e);
    showToast(MSG.SIGNUP.SIGNUP_FAIL, MESSAGES.TOAST_MSG_ERROR);
  }
}
</script>
