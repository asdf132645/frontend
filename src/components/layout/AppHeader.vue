<template>
  <header class='header'>
    <nav>
      <!-- 왼쪽 메인 메뉴 -->
      <div class='appHeaderLeft'>
        <div class="borderLine">
          <span class="greenColor">U</span>MID
        </div>
        <div class='toggleHeadBtn'>
          <font-awesome-icon :icon="['fas', 'arrows-left-right-to-line']" />
          <span> menu toggle</span>
        </div>
        <router-link to="/setting" :class='{ "leftActive": isActive("/setting") }'>
          <font-awesome-icon :icon="['fas', 'gear']"
                             style="font-size: 1rem;"
          />
          <span class='icoText'>Setting</span>
        </router-link>

        <router-link to="/analysis" :class='{ "leftActive": isActive("/analysis") || route.path === "/" }'>
          <font-awesome-icon :icon="['fas', 'chart-pie']"
                             style="font-size: 1rem;"
          />
          <span class='icoText'>Analysis</span>
        </router-link>

        <router-link to="/dataBase" :class='{ "leftActive": isActive("/dataBase") }'>
          <font-awesome-icon :icon="['fas', 'server']"
                             style="font-size: 1rem;"
          />
          <span class='icoText'>Data Base</span>
        </router-link>
      </div>

      <!--  좌측메뉴  -->
      <div class="display-flex">
        <div class="leftMenu">
          <ul>
            <li class="alarm">alarm</li>
            <li class="oliCount">oliCount</li>
            <li class="oliCount">storageUse</li>
            <li class="oliCount">out</li>
            <li class="oliCount">userInfo</li>
          </ul>
        </div>
        <div class="lastMenu">
          <ul>
            <li>Logged: 2024-01-22</li>
            <li>10:26:49
              <select>
                <option>admin</option>
              </select>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import {useRoute} from 'vue-router';

const route = useRoute();

const isActive = (path: string) => {
  return route.path === path;
};

</script>
