declare module '@vue/composition-api' {
    import { App, Ref, ComputedRef } from 'vue';
    export function install(app: App): void;
    export const ref: <T>(value: T) => Ref<T>;
    export const reactive: <T>(value: T) => T;
    export const computed: <T>(getter: () => T) => ComputedRef<T>;
    // 필요한 다른 선언 추가
}
