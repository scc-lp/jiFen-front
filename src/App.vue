<script setup lang="ts">
import { loadingManager } from './utils/loading';
import Loading from './components/Loading.vue';

// 直接使用loadingManager的状态
const loadingState = loadingManager.getState();
const loadingText = loadingManager.getText();
</script>

<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Loading :show="loadingState" :text="loadingText" />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
