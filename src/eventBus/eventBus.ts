// EventBus.ts

type EventHandler = (...args: any[]) => void;

class EventBus {
    private events: Record<string, EventHandler[]> = {};

    // 이벤트를 구독하는 메서드
    public subscribe(eventName: string, handler: EventHandler): void {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(handler);
    }

    // 이벤트를 발행하는 메서드
     public publish(eventName: string, ...args: any[]): void {
        const handlers = this.events[eventName];
        if (handlers) {
            handlers.forEach(handler => handler(...args));
        }
    }

    // 이벤트를 구독 해제하는 메서드
    public unsubscribe(eventName: string, handler: EventHandler): void {
        const handlers = this.events[eventName];
        if (handlers) {
            this.events[eventName] = handlers.filter(h => h !== handler);
        }
    }
}

export default new EventBus();
