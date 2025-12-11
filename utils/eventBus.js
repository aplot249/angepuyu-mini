// utils/eventBus.js
class EventBus {
  constructor() {
    this.events = {};
  }

  // 监听事件
  on(name, callback) {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    this.events[name].push(callback);
  }

  // 触发事件
  emit(name, data) {
    if (this.events[name]) {
      this.events[name].forEach(cb => cb(data));
    }
  }

  // 移除事件 (防止内存泄漏)
  off(name, callback) {
    if (this.events[name]) {
      this.events[name] = this.events[name].filter(cb => cb !== callback);
    }
  }
}

export const eventBus = new EventBus();