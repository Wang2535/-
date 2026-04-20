/**
 * 时间管理系统 - 全局时间同步
 * 时间管理系统 - 全局时间同步
 * 
 * 核心功能：
 * 1. 每500ms同步一次全局时间
 * 2. 回合倒计时管理
 * 3. 时间到自动结束回合
 */
export class TimeManager {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private roundStartTime: number = 0;
  private readonly ROUND_DURATION_MS = 30000; // 每回合30秒
  private readonly SYNC_INTERVAL_MS = 500;    // 同步间隔500ms
  
  private onTimeUpdate: ((remainingTime: number, progress: number) => void) | null = null;
  private onTimeUp: (() => void) | null = null;
  
  /**
   * 设置时间更新回调
   */
  setOnTimeUpdate(callback: (remainingTime: number, progress: number) => void): void {
    this.onTimeUpdate = callback;
  }
  
  /**
   * 设置时间到回调
   */
  setOnTimeUp(callback: () => void): void {
    this.onTimeUp = callback;
  }
  
  /**
   * 开始新回合计时
   */
  startRound(): void {
    this.roundStartTime = Date.now();
    this.stop(); // 先停止之前的计时
    
    // 立即发送一次时间更新
    this.syncTime();
    
    // 启动定时同步
    this.intervalId = setInterval(() => {
      this.syncTime();
    }, this.SYNC_INTERVAL_MS);
  }
  
  /**
   * 同步时间
   */
  private syncTime(): void {
    const elapsed = Date.now() - this.roundStartTime;
    const remainingTime = Math.max(0, this.ROUND_DURATION_MS - elapsed);
    const progress = Math.min(1, elapsed / this.ROUND_DURATION_MS);
    
    // 通知时间更新
    if (this.onTimeUpdate) {
      this.onTimeUpdate(remainingTime, progress);
    }
    
    // 检查时间是否耗尽
    if (remainingTime <= 0) {
      this.stop();
      if (this.onTimeUp) {
        this.onTimeUp();
      }
    }
  }
  
  /**
   * 获取当前剩余时间
   */
  getRemainingTime(): number {
    const elapsed = Date.now() - this.roundStartTime;
    return Math.max(0, this.ROUND_DURATION_MS - elapsed);
  }
  
  /**
   * 获取当前进度 (0-1)
   */
  getProgress(): number {
    const elapsed = Date.now() - this.roundStartTime;
    return Math.min(1, elapsed / this.ROUND_DURATION_MS);
  }
  
  /**
   * 停止计时
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * 重置管理器
   */
  reset(): void {
    this.stop();
    this.roundStartTime = 0;
  }
  
  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stop();
    this.onTimeUpdate = null;
    this.onTimeUp = null;
  }
}

// 单例导出
export const timeManager = new TimeManager();

export default TimeManager;
