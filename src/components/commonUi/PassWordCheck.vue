<template>
  <div class="passWordCheckBack" @click="passWordClose">
    <div class="passWordCheck" @click.stop>
      <p class="mb2">
        <font-awesome-icon :icon="['fas', 'lock']"/>
      </p>
      <p class="adminText">Admin Password</p>
      <p>
        Please enter the administrator password.
      </p>
      <input type="password" v-model="passWord" class="mt4 lockInput"/>
      <button @click="passWordCheck" class="mt1 lockBtn cursorPointer">OK</button>
      <button @click="passWordClose" class="mt1 noLockBtn cursorPointer">Close</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import {defineEmits, defineProps, ref} from "vue";

const props = defineProps({
  crcPassWord: {
    type: String,
    required: true,
  }
});
const emit = defineEmits(['returnPassWordCheck', 'passWordClose']);

const passWord = ref('');

const passWordCheck = () => {
  if (passWord.value === props.crcPassWord) {
    emit('returnPassWordCheck', true);
  } else {
    emit('returnPassWordCheck', false);
  }
}

const passWordClose = () => {
  emit('passWordClose')
}
</script>