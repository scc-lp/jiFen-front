<template>
  <div v-if="show" class="loading-overlay">
    <div class="loading-content">
      <van-loading type="spinner" color="#1989fa" :size="30" />
      <p class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: '加载中...'
  }
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: auto;
}

.loading-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.loading-text {
  font-size: 14px;
  color: #333;
  margin: 0;
}
</style>