<template>
  <div>
    <div class="textLeft mb1">
      <button class="crcBtn">
        Add
      </button>
    </div>
    <ul class="crcListContentUl">
      <li class="crcListContentHeader">
        <input type="checkbox"/>
        <span>code</span>
      </li>
      <li class="crcListContent">
        <span>
          <button>Del</button>
          <button>Edit</button>
          <input type="checkbox"/>
          <span>1</span>
          <font-awesome-icon :icon="['fas', 'sort-down']" class="sortDownBig"/>
        </span>
        <div>
          <div>
            <span class="smCrcTitle">RBC Morphology</span>
            <p>Size : Microcytic</p>
            <p>Chromicity : Microcytic</p>
          </div>
          <div>
            <span class="smCrcTitle">WBC Morphology</span>
            <p>Size : Microcytic</p>
            <p>Chromicity : Microcytic</p>
          </div>
          <div>
            <span class="smCrcTitle">PLT Morphology</span>
            <p>Size : Microcytic</p>
            <p>Chromicity : Microcytic</p>
          </div>
          <div class="mt1">
            <span class="smCrcTitle">Remark</span>
            <p>
              1 RPR정밀검사(non-treponemal test)양성이나, TLPA 정밀검사(treponemal test)상<br/>
              2 음성으로 생물학적 위양성 의심됩니다. 임신, 백신접종, 만성감염, 자가면역질환, 노인<br/>
              3 등에서 위양성을 나타낼 수 있으며, 추적검사 및 FTA-ABS IgM/IgG 검사 권장합니다.
            </p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">

</script>