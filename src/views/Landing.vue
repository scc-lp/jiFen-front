<template>
  <div class="profile-container">
    <div class="content">
      <h2 class="title">个人技术笔记</h2>
      <div class="placeholder-box">
        <p>项目正在开发中...</p>
      </div>
    </div>

    <footer class="footer-icp">
      <div class="icp-item">
        <a class="icp-link" href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">
          沪ICP备2025136518号-2
        </a>
      </div>
      
      <div class="icp-item">
        <a class="icp-link" href="http://www.beian.gov.cn/" target="_blank">
          <span class="ga-icon">
            <img src="https://beian.mps.gov.cn/web/assets/logo01.6189a29f.png" alt="">
          </span> 
          <span>沪公网安备31011402021853号</span>
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  // 确保页面标题和备案名称一致
  document.title = "个人技术笔记";
});
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa; /* 稍微给点背景色，别太白 */
  color: #333;
}

.content {
  text-align: center;
  margin-bottom: 100px;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-style: italic;
}

.placeholder-box {
  margin-top: 30px;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  color: #999;
}

.footer-icp {
  position: absolute;
  bottom: 30px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px; /* 两个备案号之间留点空隙 */
}

.icp-link {
  font-size: 13px;
  color: #999;
  text-decoration: none;
}

.icp-link:hover {
  text-decoration: underline;
}

.ga-icon {
  margin-right: 4px;
}
</style>