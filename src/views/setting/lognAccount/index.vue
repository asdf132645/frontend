<template>
  <div>
    <br>
    <br>
    <br>
    <div>
      <select v-model="userSearchOption">
        <option v-for="option in userSearchOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <input type="text" v-model="inputText">
      <button @click="onSearch">Search</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>No.</th>
          <th>User Type</th>
          <th>User ID</th>
          <th>Name</th>
          <th>Employee</th>
          <th>Subscription Date</th>
          <th>Latest Date</th>
          <th>State</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in allUsers" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.userType }}</td>
          <td>{{ user.userId }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.employeeNo }}</td>
          <td>{{ date(user.subscriptionDate) }}</td>
          <td>{{ date(user.latestDate) }}</td>
          <td>{{ user.state }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { getAllUsersApi, getUserApi } from "@/common/api/service/user/userApi";
import { UserResponse, User  } from '@/common/api/service/user/dto/userDto'
import {ApiResponse} from "@/common/api/httpClient";

const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');

const currentUserId = ref('');
const allUsers = ref<User[]>([]);

const date = (text: string) => {
  return text.replace('T', ' ').replace('.000Z', '');
}


const userSearchOption = ref('userId')

const userSearchOptions = ref([
  { value: 'userId', text: 'User Id' },
  { value: 'name', text: 'User Name' }
])


const inputText = ref('');

const onSearch = async () => {
  try {
    // api 받아옴
    const result = await getAllUsersApi(String(currentUserId.value))

    if (result) {
      if (!result?.data) {
        console.log(null)
      } else {
        if (userSearchOption.value === 'userId') {
          const filteredUsers = result.data.users && result.data.users.filter(item => item.userId.includes(inputText.value));
          allUsers.value = filteredUsers || [];
        } else if (userSearchOption.value === 'name') {
          const filteredUsers = result.data.users && result.data.users.filter(item => item.name.includes(inputText.value));
          allUsers.value = filteredUsers || [];
        }
        inputText.value = ''; 
      }
    }

  } catch (e) {
    console.log(e);
  }
}


onMounted(async () => {
  currentUserId.value = getStoredUser.id;
  await getAllUsers();
});

const getAllUsers = async() => {
  try {
    // api 받아옴
    const result = await getAllUsersApi(String(currentUserId.value))
    console.log('result - get all users')

    if (result) {
      if (!result?.data) {
        console.log(null)
      } else {
        allUsers.value = result.data.users || []
      }
    }

  } catch (e) {
    console.log(e);
  }
}

</script>
