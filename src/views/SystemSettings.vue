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
    </el-form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { getTheme, setTheme, applyTheme } from '../utils/theme';

const settings = reactive({
  notifications: true,
  autoUpdate: false,
  theme: getTheme()
});

watch(() => settings.theme, (val) => {
  setTheme(val);
  applyTheme(val);
});
</script>

<style scoped>
.system-settings {
  padding: 20px;
}
</style>