// EventBus.ts
import { ref, Ref } from 'vue';

// 이벤트 버스 인터페이스
interface EventBus {
    emit(event: string, ...args: any[]): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
}

// 실제 이벤트 버스 객체
class EventBusImpl implements EventBus {
    private listeners: Record<string, ((...args: any[]) => void)[]> = {};

    emit(event: string, ...args: any[]): void {
        if (this.listeners[event]) {
            this.listeners[event].forEach((callback) => {
                callback(...args);
            });
        }
    }

    on(event: string, callback: (...args: any[]) => void): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event: string, callback: (...args: any[]) => void): void {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(
                (cb) => cb !== callback
            );
        }
    }
}

// 전역으로 공유할 이벤트 버스
const eventBus: Ref<EventBus> = ref(new EventBusImpl());

export function provideEventBus(): EventBus {
    return eventBus.value;
}

export function useEventBus(): EventBus {
    return eventBus.value;
}
