<template>
  <div class="settingCellImgAnalyzedContainer">
    <table class="settingTable">
      <tbody>
        <tr>
          <th>CRC</th>
          <td>
            <font-awesome-icon
                :icon="isToggle ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                class="iconSize"
                @click="toggle"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="isToggle">
      <ul>
        <li>ss</li>
      </ul>
    </div>
  </div>
  <div class="mt1">
    <button class="saveBtn" type="button">Save</button>
  </div>
</template>
<script setup lang="ts">
import {ref} from "vue";

const isToggle = ref(false);

const toggle = () => {
  isToggle.value = !isToggle.value;
};
</script>