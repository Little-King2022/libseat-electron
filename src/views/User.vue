<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/userStore';

// 数据定义
const systemSetting = ref({})
const userStore = useUserStore();

// 登录表单
const loginForm = reactive({
  stu_id: '',
  stu_pwd: '',
});

// 登录类型
const loginType = ref(2); // 默认使用账号密码登录

// 方法定义
const login = async () => {
  if (!loginForm.stu_id) {
    ElMessage.warning('请输入学号');
    return;
  }
  if (!loginForm.stu_pwd) {
    ElMessage.warning('请输入密码');
    return;
  }
  await userStore.login(loginForm);
};

const logout = () => {
  userStore.logout();
};


onMounted(() => {
  // 获取系统设置
  window.api.invoke('db:get-system-setting').then(result => {
    console.log('系统设置:', result)
    systemSetting.value = result
    // 加载到全局
    window.systemSetting = result
  }).catch(error => {
    console.error('获取系统设置失败:', error)
    ElMessage.error('获取系统设置失败')
  })
});

// 监听 systemSetting 变化，更新 loginForm
watch(() => systemSetting.value, (newVal) => {
  if (newVal) {
    loginForm.stu_id = newVal.stu_id || '';
    loginForm.stu_pwd = newVal.stu_pwd || '';
  }
}, { immediate: true });
</script>

<template>
  <div class="user-container">
    <el-card class="user-card">
      <div class="user-info">
        <el-avatar :size="100"
          :src="userStore.isLoggedIn ? 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' : ''">{{
            userStore.isLoggedIn ? userStore.userInfo.stu_name.substring(0, 1) : '未登录' }}</el-avatar>
        <div class="user-name">
          <template v-if="!userStore.isLoggedIn">
            <el-tag type="info">请先登录</el-tag>
            <div>游客用户</div>
          </template>
          <template v-else>
            <el-tag v-if="userStore.userInfo.logonName" type="success">学生身份已认证</el-tag>
            <div v-if="userStore.userInfo.logonName">{{ userStore.userInfo.logonName + ' ' + userStore.userInfo.trueName }}</div>
          </template>
        </div>
      </div>
      <template v-if="userStore.isLoggedIn">
        <el-descriptions :column="1" border style="margin-top: 20px;">
          <el-descriptions-item label="我的信用分">
            {{ userStore.userInfo.credit }} / 600 分
          </el-descriptions-item>
          <el-descriptions-item label="绑定手机号">
            {{ userStore.userInfo.handPhone ? userStore.userInfo.handPhone : '未绑定，请前往学校官网进行绑定' }} 
          </el-descriptions-item>
          <el-descriptions-item v-if="userStore.userInfo.is_vip" label="通知方式">
            开发中
          </el-descriptions-item>
          <el-descriptions-item v-if="userStore.userInfo.is_vip" label="设置预约时段">
            {{ userStore.userInfo.resv_start_time ? userStore.userInfo.resv_start_time + '~22:00' : '暂未设置' }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-card>
    <el-card class="login-card">
      <template v-if="!userStore.isLoggedIn">
        <div class="login-title">Hi👋 请登录</div>
        <el-form :model="loginForm" label-width="80px" style="margin-top: 20px;">
          <el-form-item label="服务器">
            <el-input v-model="systemSetting.host_url" type="test" placeholder="请输入服务器地址" maxlength="100" clearable
              tips="1">
              <template #append>非必要勿动</template>
            </el-input>
          </el-form-item>
          <el-form-item label="学号">
            <el-input v-model="loginForm.stu_id" placeholder="请输入学号" maxlength="12" clearable />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="loginForm.stu_pwd" type="password" placeholder="请输入密码" maxlength="30" clearable
              show-password />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="login" style="width: 100%;">登 录</el-button>
          </el-form-item>
          <div class="login-tip">默认密码为njfu+身份证后6位+!</div>
        </el-form>
      </template>
      <template v-else>
        <el-button type="danger" @click="logout" style="width: 100%;">注销登录</el-button>
      </template>
    </el-card>
    <div class="version-info">
      <p>Version: 1.0.0</p>
      <p>苏ICP备2023036460号-1X</p>
    </div>
  </div>
</template>

<style scoped>
.user-container {
  padding: 20px;
}

.user-card,
.login-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.user-name {
  margin-left: 20px;
}

.user-name div {
  margin-top: 10px;
  font-size: 16px;
}

.login-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.login-tip {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-info {
  text-align: center;
  color: #909399;
  font-size: 12px;
  margin-top: 20px;
}

.version-info p {
  margin: 5px 0;
}
</style>