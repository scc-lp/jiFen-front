<template>
  <transition name="toast-fade">
    <div v-if="visible" class="toast" :class="type">
      <div class="toast-content">
        <van-icon v-if="type === 'success'" name="success" />
        <van-icon v-else-if="type === 'error'" name="fail" />
        <van-icon v-else-if="type === 'warning'" name="warning" />
        <van-icon v-else-if="type === 'info'" name="info" />
        <span>{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value: string) => ['success', 'error', 'warning', 'info'].includes(value)
  }
});
</script>

<style scoped>
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 20px;
  border-radius: 8px;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.toast.success {
  background-color: rgba(76, 175, 80, 0.9);
  color: white;
}

.toast.error {
  background-color: rgba(244, 67, 54, 0.9);
  color: white;
}

.toast.warning {
  background-color: rgba(255, 193, 7, 0.9);
  color: white;
}

.toast.info {
  background-color: rgba(33, 150, 243, 0.9);
  color: white;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}
</style>