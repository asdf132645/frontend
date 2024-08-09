/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// vue-virtual-scroller 모듈 선언 추가
declare module 'vue-virtual-scroller' {
  import type { DefineComponent } from 'vue'

  // 모듈 내 컴포넌트들에 대한 타입 정의
  export const RecycleScroller: DefineComponent<{}, {}, any>
  export const DynamicScroller: DefineComponent<{}, {}, any>
  export const DynamicScrollerItem: DefineComponent<{}, {}, any>
}
