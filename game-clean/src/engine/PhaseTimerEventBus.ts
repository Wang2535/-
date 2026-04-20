/**
 * 阶段计时器事件总线
 * 用于在组件间安全地传递倒计时相关事件
 */

type TimerCallback = () => void;
type AddTimeCallback = (seconds: number) => void;

class PhaseTimerEventBusClass {
  private onTimerEndCallbacks: TimerCallback[] = [];
  private addTimeCallbacks: AddTimeCallback[] = [];
  private currentTime: number = 0;

  onTimerEnd(callback: TimerCallback): () => void {
    this.onTimerEndCallbacks.push(callback);
    return () => {
      this.onTimerEndCallbacks = this.onTimerEndCallbacks.filter(cb => cb !== callback);
    };
  }

  onAddTime(callback: AddTimeCallback): () => void {
    this.addTimeCallbacks.push(callback);
    return () => {
      this.addTimeCallbacks = this.addTimeCallbacks.filter(cb => cb !== callback);
    };
  }

  triggerTimerEnd(): void {
    this.onTimerEndCallbacks.forEach(callback => callback());
  }

  triggerAddTime(seconds: number): void {
    this.addTimeCallbacks.forEach(callback => callback(seconds));
  }

  setCurrentTime(time: number): void {
    this.currentTime = time;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }
}

export const PhaseTimerEventBus = new PhaseTimerEventBusClass();
