import { ref } from 'vue';

// 이미지 DOM 참조 객체
const imageRefs = ref<Record<string, HTMLElement | null>>({});

// ref 등록 함수
const setImageRef = (key: string, el: HTMLElement | null) => {
    if (el) {
        imageRefs.value[key] = el;
    }
};

export const useImageRefs = () => ({
    imageRefs,
    setImageRef,
});
