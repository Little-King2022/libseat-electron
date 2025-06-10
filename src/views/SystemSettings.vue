<template>
  <div class="system-settings">
    <h2>系统设置</h2>
    <el-form label-width="120px" style="padding-top: 20px;">
      <el-form-item label="主题">
        <el-select v-model="settings.theme" placeholder="请选择主题">
          <el-option label="浅色" value="light"></el-option>
          <el-option label="深色" value="dark"></el-option>
          <el-option label="跟随系统" value="auto"></el-option>
        </el-select>
      </el-form-item>
      <!-- 设置预约开始时间，下拉选择框，8:00/9:00/10:00 -->
      <el-form-item label="预约开始时间">
        <el-select v-model="settings.start_time" placeholder="请选择预约开始时间">
          <el-option label="8:00" value="08:00"></el-option>
          <el-option label="8:30" value="08:30"></el-option>
          <el-option label="9:00" value="09:00"></el-option>
          <el-option label="9:30" value="09:30"></el-option>
          <el-option label="10:00" value="10:00"></el-option>
          <el-option label="10:30" value="10:30"></el-option>
          <el-option label="11:00" value="11:00"></el-option>
          <el-option label="11:30" value="11:30"></el-option>
          <el-option label="12:00" value="12:00"></el-option>
          <el-option label="12:30" value="12:30"></el-option>
          <el-option label="13:00" value="13:00"></el-option>
          <el-option label="13:30" value="13:30"></el-option>
          <el-option label="14:00" value="14:00"></el-option>
          <el-option label="14:30" value="14:30"></el-option>
          <el-option label="15:00" value="15:00"></el-option>
          <el-option label="15:30" value="15:30"></el-option>
          <el-option label="16:00" value="16:00"></el-option>
          <el-option label="16:30" value="16:30"></el-option>
          <el-option label="17:00" value="17:00"></el-option>
          <el-option label="17:30" value="17:30"></el-option>
          <el-option label="18:00" value="18:00"></el-option>
          <el-option label="18:30" value="18:30"></el-option>
          <el-option label="19:00" value="19:00"></el-option>
        </el-select>
      </el-form-item>
      <!-- 设置预约结束时间，下拉选择框，18:00/19:00/20:00 -->
      <!-- 更新数据库 -->
      <el-form-item label="系统数据库">
        <el-button type="primary" @click="updateDatabase" style="width: 180px;">更新系统数据库</el-button>
      </el-form-item>
      <el-form-item label="软件更新">
        <el-button style="width: 180px;" @click="openUpdateLink">
          检查软件更新
        </el-button>
      </el-form-item>


    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref, watch, h, onMounted } from 'vue';
import { getTheme, setTheme, applyTheme } from '../utils/theme';
import { ElNotification, ElMessage, ElLoading, ElMessageBox } from 'element-plus';
import { useUserStore } from '../stores/userStore';

const version = ref('')

const settings = reactive({
  notifications: true,
  autoUpdate: false,
  theme: getTheme(),
  start_time: useUserStore().userInfo.resv_start_time,
});

watch(() => settings.theme, (val) => {
  setTheme(val);
  applyTheme(val);
});

// 更新useUserStore().userInfo.resv_start_time
watch(() => settings.start_time, (val) => {
  useUserStore().userInfo.resv_start_time = val;
  window.api.invoke('update-resv-start-time', val).then(res => {
    if (res.success) {
      ElMessage.success('预约开始时间更新成功');
    } else {
      ElMessage.error('预约开始时间更新失败');
    }
  });
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

  const loading = ElLoading.service({
    lock: true,
    text: '正在更新图书馆数据库，请耐心等待...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  setTimeout(() => {
    updateDatabaseStatus.value = '正在更新楼层列表...';
    window.api.invoke('update-seat-menu-database').then((res) => {
      updateDatabaseStatus.value = res.message;
      if (res.success) {
        updateDatabaseStatus.value = '正在更新座位列表...';
        window.api.invoke('update-seat-list-database').then(res => {
          updateDatabaseStatus.value = res.message;
          if (res.success) {
            updateDatabaseStatus.value = '座位列表更新成功';
            ElMessage.success('数据库更新成功');
            // 更新系统设置状态，避免需要重启
            useUserStore().systemSetting.has_init = 1;
          } else {
            ElMessage.error('座位数据库更新失败');
          }
          loading.close();
        });
      } else {
        ElMessage.error('楼层数据库更新失败');
        loading.close();
      }
    }).catch((err) => {
      updateDatabaseStatus.value = '数据库更新失败: ' + err.message;
      ElMessage.error('数据库更新失败: ' + err.message);
      loading.close();
    });
  }, 500);

}
const openUpdateLink = () => {
  // 显示弹窗
  ElMessageBox.confirm('当前软件版本号 v' + version.value + '，点击确定后，请拉动到页面底部，查看是否有新版本发布', '软件更新', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 打开更新链接
    window.open('https://github.com/Little-King2022/libseat-electron/releases/latest', '_blank');
  }).catch(() => {
    // 取消更新
  });
}

onMounted(async () => {
  version.value = await window.api.invoke('get-app-version')
});

</script>

<style scoped>
.system-settings {
  padding: 20px;
}
</style>