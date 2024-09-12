type EventHandler = (...args: any[]) => void | Promise<void>;

class EventBus {
    private events: Record<string, EventHandler[]> = {};

    // 이벤트를 구독하는 메서드
    public subscribe(eventName: string, handler: EventHandler): void {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(handler);
    }

    // 이벤트를 비동기적으로 발행하는 메서드 (Promise 반환)
    public async publish(eventName: string, ...args: any[]): Promise<void> {
        const handlers = this.events[eventName];
        if (handlers) {
            for (const handler of handlers) {
                await handler(...args);  // 각 핸들러가 프로미스를 반환하면 대기
            }
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
