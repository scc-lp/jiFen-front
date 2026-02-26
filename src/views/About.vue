<template>
  <div class="about-container">
    <!-- 头部导航 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" @click="goBack" />
      <h1>关于我们</h1>
    </div>

    <!-- 主要内容 -->
    <div class="content">
      <!-- 声明内容 -->
      <div class="declaration">
        <h2 class="declaration-title">关于棋牌记分数工具的正式声明</h2>
        <div class="declaration-content">
          <p>本人独立开发一款 棋牌 / 麻将记分数工具 ，本工具仅为 亲友休闲娱乐、便捷记录分数 的辅助工具， 不涉及任何赌博功能 ，无现金结算、无筹码交易、无赌博引导、无任何与赌博相关的设计与用途。</p>
          <p>本工具 仅限合法、健康、非赌博性质的娱乐活动使用 。使用者应严格遵守国家法律法规及社会公序良俗，严禁将本工具用于赌博、变相赌博或其他任何违法违规活动。</p>
          <p>凡使用本工具者，均视为已阅读并同意本声明。因违规使用所产生的一切法律责任、经济损失及相关后果，均由使用者自行承担，开发者不承担任何连带责任。</p>
          <p>特此声明。</p>
          <p>本声明最终解释权归开发者所有。</p>
          <p class="developer">开发者：Daniel</p>
          <p class="date">日期：2026年2月26日</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.about-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-bar h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-align: center;
}

.content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.declaration {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.declaration-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 24px 0;
  text-align: center;
  color: #333;
}

.declaration-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.declaration-content p {
  margin: 0 0 16px 0;
  text-align: justify;
}

.declaration-content p:last-child {
  margin-bottom: 0;
}

.developer {
  margin-top: 24px !important;
  font-weight: 500;
}

.date {
  font-style: italic;
  color: #666;
}
</style>