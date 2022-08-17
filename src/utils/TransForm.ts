import { ref, computed, Ref } from "vue";

export interface TransForm {
    rotate: number;
    scale: number;
    translateX: number;
    translateY: number;
    value: string;
}

export const useTransForms = () => {
    const remixTransForm = ref<TransForm>({});
    const overlayTransForms = ref<TransForm[]>([]);
    
    const remixTransFormStr = computed<TransForm>(() => {

        return remixTransForm.value;
    })
}