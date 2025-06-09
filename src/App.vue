<script setup>
import SideMenu from './components/SideMenu.vue'
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { getTheme, applyTheme } from './utils/theme';
import { ElMessage } from 'element-plus';
import { useUserStore } from './stores/userStore'

let mediaQuery = null;
const userStore = useUserStore()

function handleSystemThemeChange(e) {
  const currentTheme = getTheme();
  if (currentTheme === 'auto') {
    applyTheme('auto');
  }
}

const reservationRunning = ref(false)

const checkTaskStatus = async () => {
  reservationRunning.value = await window.api.invoke('task:is-running')
}

onMounted(async () => {
  // 程序启动时立即应用主题
  applyTheme(getTheme());

  // 监听系统主题变化
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', handleSystemThemeChange);

  await userStore.tryAutoLogin()

  // 展示用户信息
  if (userStore.userInfo.trueName) {
    ElMessage.success(`欢迎回来，${userStore.userInfo.trueName}！`);
  }

  // 每隔5秒检查一次任务状态
  checkTaskStatus()
  setInterval(checkTaskStatus, 1000)
});



onBeforeUnmount(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }
});
</script>

<template>
  <el-container class="app-container">
    <el-aside width="150px">
      <SideMenu />
    </el-aside>
    <el-main>
      <el-alert v-if="reservationRunning" title="自动预约程序运行中" type="success" show-icon :closable="false"/>
      <el-alert v-if="!reservationRunning" title="自动预约程序未运行, 请尝试重启" type="error" show-icon :closable="false"/>
      
      <router-view />
    </el-main>
  </el-container>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  width: 100%;
}

#app {
  height: 100vh;
  width: 100vw;
}

.app-container {
  height: 100%;
  width: 100%;
}

.el-aside {
  /* background-color: #f5f7fa;
  color: #333; */
  height: 100%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.el-main {
  /* padding: 20px; */
  /* background-color: #fff; */
  height: 100%;
  overflow-y: auto;
}
</style>
