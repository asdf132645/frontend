import { ref } from "vue";

export const useToast = () => {
    const toastInfo = ref({ message: "", messageType: "" });

    const showToast = (message: string, type: string) => {
        if (toastInfo.value.message) {
            toastInfo.value = { message: '', messageType: '' };
        }

        setTimeout(() => {
            toastInfo.value = { message: message, messageType: type };
        }, 0);
    };

    return { toastInfo, showToast };
}