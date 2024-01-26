module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential', // Vue 3 기본 규칙
    '@vue/typescript/recommended', // Vue와 함께 TypeScript 사용 시 권장 설정
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser', // TypeScript 파서 사용
  },
  rules: {
    // 여기에 프로젝트에 맞는 규칙을 추가하거나 변경할 수 있습니다.
    'vue/no-multiple-template-root': 'off', // 여러 개의 루트 요소 허용
    'vue/multi-word-component-names': 'off', // 다중 단어 컴포넌트 이름 비활성화
    '@typescript-eslint/ban-ts-comment': 'off',
  },
};
