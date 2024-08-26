<template>
  <div class="settingContainer">
    <div class="searchUserContainer">
      <select v-model="userSearchOption" class="searchSelect">
        <option v-for="option in userSearchOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <input type="text" v-model="inputText" class="searchInputBox">
      <font-awesome-icon :icon="['fas', 'search']" class="searchBtn" @click="onSearch"/>

    </div>
    <table class="table defaultTable mt2">
      <thead>
        <tr>
          <th>No.</th>
          <th>User Type</th>
          <th>User ID</th>
          <th>Name</th>
          <th>Employee</th>
          <th>Subscription Date</th>
          <th>Latest Date</th>
          <template v-if="getStoredUser.userType.includes('admin')">
            <th>Edit</th>
            <th>Delete</th>
          </template>
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
          <template v-if="getStoredUser.userType.includes('admin')">
            <td class="cursorPointer hoverSizeAction" @click="openLayer(user.userId)">
              <font-awesome-icon :icon="['fas', 'pen-to-square']" />
            </td>
            <td class="cursorPointer hoverSizeAction" @click="handleDeleteUser(user.userId)">
              <font-awesome-icon :icon="['fas', 'trash']" />
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>

  <Modal v-if="isModalVisible" @update:closeLayer="closeLayer" @afterOpen="onModalOpen">
    <template #header>
      <h2>Edit Account</h2>
    </template>

    <template #content>
      <div class="editModalContainer">
        <div class="userInputWrapper">
          <label class="userLabel" for="userType" style="line-height: 0">User Type</label>
          <select id="userType" v-model="selectedUserData.userType" class="searchSelect inputMiddleWrapper" style="width: 132px !important;">
            <option v-for="option in userTypeOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
          </select>
        </div>

        <div class="userInputWrapper">
          <label class="userLabel" for="userId">User ID</label>
          <input id="userId" class="inputMiddleWrapper disabledInput" type="text" v-model="selectedUserData.userId" disabled readonly />
        </div>

        <div class="userInputWrapper">
          <label class="userLabel" for="userName">Name</label>
          <input id="userName" class="inputMiddleWrapper" type="text" v-model="selectedUserData.name" />
        </div>

        <div class="userInputWrapper">
          <label class="userLabel" for="employeeNo">Employee</label>
          <input id="employeeNo" class="inputMiddleWrapper" type="text" v-model="selectedUserData.employeeNo" />
        </div>

        <div class="userInputWrapper">
          <label class="userLabel" for="subscriptionDate">Subscription Date</label>
          <input id="subscriptionDate" class="inputMiddleWrapper disabledInput" type="text" v-model="formattedSubscriptionDate" disabled />
        </div>

        <div class="userInputWrapper">
          <label class="userLabel" for="latestDate">Latest Date</label>
          <input id="latestDate" class="inputMiddleWrapper disabledInput" type="text" v-model="formattedLatestDate" disabled />
        </div>

      </div>

      <div class="modalBottom">
        <button type="button" class="alertButton" @click="putSelectedUserData">Edit</button>
      </div>
    </template>
  </Modal>

  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      :type="confirmType"
      :message="confirmMessage"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {deleteUserApi, getAllUsersApi, getUserApi, putUserDataApi} from "@/common/api/service/user/userApi";
import { User } from '@/common/api/service/user/dto/userDto'
import Modal from "@/components/commonUi/modal.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import router from "@/router";
import {useStore} from "vuex";

const store = useStore()
const storedUser = computed(() => store.state.userModule)
const getStoredUser = storedUser.value;
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
const userTypeOptions = ref([
  { value: 'normal', text: 'normal'},
  { value: 'admin', text: 'admin'},
])

const inputText = ref('');
const isModalVisible = ref(false);
const selectedUserData = ref<any>({});
const selectedUserId = ref('');
const formattedSubscriptionDate = computed(() => date(selectedUserData.value.subscriptionDate))
const formattedLatestDate = computed(() => date(selectedUserData.value.latestDate))
const showConfirm = ref(false);
const confirmType = ref('');
const confirmMessage = ref('');

onMounted(async () => {
  currentUserId.value = getStoredUser.userId;
  await getAllUsers();
});

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
    }

  } catch (error) {
    console.error('An error occurred:', error);
  }
};

const putSelectedUserData = async () => {
  try {
    await putUserDataApi(selectedUserData.value, selectedUserId.value);
    await getAllUsers();
    isModalVisible.value = false;

    const currentUserData: any = allUsers.value.find((user) => user.userId === currentUserId.value)
    await store.dispatch('userModule/setUserAction', {
      id: currentUserData.id,
      userId: currentUserData.userId,
      employeeNo: currentUserData.employeeNo,
      latestDate: currentUserData.latestDate,
      password: currentUserData.password,
      subscriptionDate: currentUserData.subscriptionDate,
      userType: currentUserData.userType,
      name: currentUserData.name,
    })
    sessionStorage.setItem('user', JSON.stringify(allUsers.value.find((user) => user.userId === currentUserId.value)));
    localStorage.setItem('user', JSON.stringify(allUsers.value.find((user) => user.userId === currentUserId.value)));
  } catch (e) {
    console.log(e);
  }
}

const getAllUsers = async () => {
  try {
    const result = await getAllUsersApi(String(currentUserId.value))

    if (result && result?.data) {
      allUsers.value = result.data.users || []
    }

  } catch (e) {
    console.log(e);
  }
}

const getSelectedUser = async (selectedUserIdParam: string) => {
  selectedUserId.value = selectedUserIdParam;
  try {
    const result: any = await getUserApi(selectedUserIdParam)
    selectedUserData.value = result.data.user;
  } catch (e) {
    console.log(e);
  }
}

const openLayer = async (selectedUserId: string) => {
  await getSelectedUser(selectedUserId);
  if (selectedUserId === '') return;
  isModalVisible.value = true;
}

const onModalOpen = () => {
  //
}

const closeLayer = (isVisible: boolean) => {
  isModalVisible.value = isVisible;
  selectedUserData.value = {};
  selectedUserId.value = '';
}

const hideConfirm = () => {
  showConfirm.value = false;
}

const handleOkConfirm = async () => {
  showConfirm.value = false;

  try {
    await deleteUserApi({ userId: selectedUserId.value })
    await getAllUsers();

    // 현재 User가 자기 자신을 삭제할 경우
    if (selectedUserId.value === currentUserId.value) {
      router.push('/user/login');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
  } catch (e) {
    console.log(e);
  }
}

const handleDeleteUser = (selectedUserIdParam: string) => {
  showConfirm.value = true;
  selectedUserId.value = selectedUserIdParam;
  confirmMessage.value = `Do you wish to proceed with deleting user ID ${selectedUserIdParam}?`
}

</script>