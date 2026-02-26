import { createApp, h } from 'vue';
import Toast from '../components/Toast.vue';

interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

class ToastUtil {
  private toastApp: any = null;
  private toastElement: HTMLElement | null = null;
  private timer: number | null = null;

  show(options: string | ToastOptions) {
    // 清除之前的toast
    this.clear();

    // 处理参数
    const opts = typeof options === 'string' ? { message: options } : options;
    const { message, type = 'info', duration = 2000 } = opts;

    // 创建DOM元素
    this.toastElement = document.createElement('div');
    document.body.appendChild(this.toastElement);

    // 创建Vue应用
    this.toastApp = createApp({
      render: () => h(Toast, { visible: true, message, type })
    });

    // 挂载应用
    this.toastApp.mount(this.toastElement);

    // 设置定时器，自动关闭
    this.timer = window.setTimeout(() => {
      this.clear();
    }, duration);
  }

  success(message: string, duration?: number) {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number) {
    this.show({ message, type: 'error', duration });
  }

  warning(message: string, duration?: number) {
    this.show({ message, type: 'warning', duration });
  }

  info(message: string, duration?: number) {
    this.show({ message, type: 'info', duration });
  }

  private clear() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.toastApp && this.toastElement) {
      this.toastApp.unmount();
      document.body.removeChild(this.toastElement);
      this.toastApp = null;
      this.toastElement = null;
    }
  }
}

// 导出单例
export const toast = new ToastUtil();
