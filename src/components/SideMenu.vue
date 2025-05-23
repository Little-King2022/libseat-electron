<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const activeIndex = ref(route.path);

watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath;
  }
);

const handleSelect = (key) => {
  // 导航到对应的页面
  router.push(key);
};
</script>

<template>
  <div class="side-menu">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-vertical"
      @select="handleSelect"
      router
    >
      <el-menu-item index="/home">
        <el-icon><House /></el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/reservation">
        <el-icon><Calendar /></el-icon>
        <span>自动预约</span>
      </el-menu-item>
      <el-menu-item index="/reservation-history">
        <el-icon><Document /></el-icon>
        <span>预约记录</span>
      </el-menu-item>
      <el-menu-item index="/user">
        <el-icon><User /></el-icon>
        <span>个人中心</span>
      </el-menu-item>
      <el-menu-item index="/system-setting">
        <el-icon><Setting /></el-icon>
        <span>系统设置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
.side-menu {
  height: 100vh;
  /* background-color: #f5f7fa; */
  position: relative; /* 添加相对定位，作为绝对定位的参考 */
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}
</style>