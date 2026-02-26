import { ref } from 'vue';
import type { Ref } from 'vue';

// 全局加载状态管理
class LoadingManager {
  private static instance: LoadingManager;
  private loadingState: Ref<boolean>;
  private loadingText: Ref<string>;

  private constructor() {
    this.loadingState = ref(false);
    this.loadingText = ref('加载中...');
  }

  public static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  public show(text: string = '加载中...') {
    this.loadingText.value = text;
    this.loadingState.value = true;
  }

  public hide() {
    this.loadingState.value = false;
  }

  public getState(): Ref<boolean> {
    return this.loadingState;
  }

  public getText(): Ref<string> {
    return this.loadingText;
  }
}

// 导出单例实例
export const loadingManager = LoadingManager.getInstance();

// 提供加载状态管理
export function provideLoading() {
  return {
    showLoading: (text?: string) => loadingManager.show(text),
    hideLoading: () => loadingManager.hide(),
    loadingState: loadingManager.getState(),
    loadingText: loadingManager.getText()
  };
}

// 注入加载状态管理
export function useLoading() {
  return {
    show: (text?: string) => loadingManager.show(text),
    hide: () => loadingManager.hide(),
    state: loadingManager.getState(),
    text: loadingManager.getText()
  };
}
