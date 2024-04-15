<template>
  <div class="settingContainer">
    <div class="searchUserContainer">
      <select v-model="userSearchOption" class="userSearch">
        <option v-for="option in userSearchOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <input type="text" v-model="inputText" class="searchInputBox">
      <button @click="onSearch" class="searchBtn">Search</button>
    </div>
    <table class="table">
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



onMounted(async () => {
  currentUserId.value = getStoredUser.id;
  await getAllUsers();
});


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

const filterUsers = (users: any[], searchText: any, searchOption: string) => {
  const searchQuery = searchText.toLowerCase();
  return users.filter(item => {
    const searchField = searchOption === 'userId' ? String(item.userId) : item.name;
    return searchField.toLowerCase().includes(searchQuery);
  });
};

const onSearch = async () => {
  try {
    const result = await getAllUsersApi(String(currentUserId.value));

    if (result && result.data) {
      const users = result.data.users || [];
      const filteredUsers = filterUsers(users, inputText.value, userSearchOption.value);
      allUsers.value = filteredUsers;
    } else {
      console.log('No data received from the API');
    }

  } catch (error) {
    console.error('An error occurred:', error);
  }
};

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

<style lang="css" scoped>
@import "@/assets/css/setting/loginAccount.css";
</style>