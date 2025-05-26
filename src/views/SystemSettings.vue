<template>
  <div class="system-settings">
    <h2>系统设置</h2>
    <el-form label-width="120px" style="padding-top: 20px;">
      <!-- <el-form-item label="通知设置">
        <el-switch v-model="settings.notifications" />
      </el-form-item>
      <el-form-item label="自动更新">
        <el-switch v-model="settings.autoUpdate" />
      </el-form-item> -->
      <el-form-item label="主题">
        <el-select v-model="settings.theme" placeholder="请选择主题">
          <el-option label="浅色" value="light"></el-option>
          <el-option label="深色" value="dark"></el-option>
          <el-option label="跟随系统" value="auto"></el-option>
        </el-select>
      </el-form-item>
      <!-- 更新数据库 -->
      <el-form-item label="数据库">
        <el-button type="primary" @click="updateDatabase" style="width: 180px;">更新图书馆数据库</el-button>
      </el-form-item>

    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref, watch, h } from 'vue';
import { getTheme, setTheme, applyTheme } from '../utils/theme';
import { ElNotification, ElMessage } from 'element-plus';
import { useUserStore } from '../stores/userStore';

const settings = reactive({
  notifications: true,
  autoUpdate: false,
  theme: getTheme()
});

watch(() => settings.theme, (val) => {
  setTheme(val);
  applyTheme(val);
});

// updateDatadase
const updateDatabaseStatus = ref('正在初始化...');
const updateDatabase = () => {
  if (!useUserStore().isLoggedIn) {
    ElMessage.warning('请先登录');
    return;
  }

  const NotificationContent = () => h('div', null, updateDatabaseStatus.value)
  ElNotification({
    title: '数据库更新状态',
    message: h(NotificationContent),
    duration: 10000,
  })

  setTimeout(() => {
    window.api.invoke('update-seat-menu-database').then((res) => {
      updateDatabaseStatus.value = res.message;
      if (res.success) {
        ElMessage.success('数据库更新成功');
      } else {
        ElMessage.error('数据库更新失败');
      }
    }).catch((err) => {
      ElMessage.error('数据库更新失败: ' + err.message);
    });
  }, 1000);

}
</script>

<style scoped>
.system-settings {
  padding: 20px;
}
</style>