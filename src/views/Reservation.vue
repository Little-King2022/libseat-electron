<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/userStore';

// 数据定义
const resvSeatInput = ref('')
const resvSeatList = ref([])
const showResvSelectList = ref(false)
const resvSeatNameList = ref([])
const resvSeatIdList = ref([])
const userStore = useUserStore();

// 当前预约任务数据
const showNowResvDetail = ref(false)
const taskStuId = ref('')
const taskCreateTime = ref('')
const taskSeatNameList = ref('')
const lastResvResult = ref('')
const lastResvLog = ref('')

// 座位号查询输入
const handleResvSeatInput = async () => {
  if (resvSeatInput.value && resvSeatInput.value.length >= 1) {
    try {
      const result = await window.api.invoke('db:search-seat-by-name', resvSeatInput.value)
      console.log('查询结果:', result)
      resvSeatList.value = result.map(seat => ({ seat }))
    } catch (error) {
      console.error('查询座位信息失败:', error)
      ElMessage.error('查询失败，请检查本地数据库连接')
      resvSeatList.value = []
    }
  } else {
    resvSeatList.value = []
  }
}

const handleResvSeatSelect = (seat) => {
  // 添加到预选列表
  console.log('选择的座位:', seat)
  if (!resvSeatIdList.value.includes(seat.seat.seat_id)) {
    // 检查长度不允许超过5个
    if (resvSeatIdList.value.length >= 5) {
      ElMessage.warning('预选座位列表已满，请先删除一些座位')
      return
    }
    resvSeatIdList.value.push(seat.seat.seat_id)
    resvSeatNameList.value.push(seat.seat.seat_name)
    showResvSelectList.value = true
    ElMessage.success(`已添加座位 ${seat.seat.seat_name} 到预选列表`)
  } else {
    ElMessage.warning(`座位 ${seat.seat.seat_name} 已在预选列表中`)
  }
}

const clearResvSeatList = () => {
  resvSeatIdList.value = []
  resvSeatNameList.value = []
  resvSeatList.value = []
  showResvSelectList.value = false
}

const submitResvList = async () => {
  if (resvSeatIdList.value.length === 0) {
    ElMessage.warning('请先添加预选座位')
    return
  }

  const task = {
    stuId: userStore.userInfo.logonName,
    stuName: userStore.userInfo.trueName,
    stuPwd: userStore.systemSetting.stu_pwd,
    cookie: userStore.systemSetting.token,
    userData: userStore.systemSetting.user_data,
    seatList: resvSeatIdList.value.map((seatId, index) => ({
      id: seatId.toString(),
      name: resvSeatNameList.value[index].toString()
    })),
    startTime: userStore.userInfo.resv_start_time || '8:00',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    result: ''
  }

  console.log('提交的预约任务:', task)
  const res = await window.api.invoke('task:save', task)
  if (res.success) {
    ElMessage.success('预约任务提交成功')
    clearResvSeatList()
    await getNowResvDetail()
  } else {
    ElMessage.error('任务保存失败: ' + res.message)
  }
}

const deleteResvList = async () => {
  const res = await window.api.invoke('task:delete')
  if (res.success) {
    ElMessage.success('预约任务删除成功')
    showNowResvDetail.value = false
  } else {
    ElMessage.error('删除失败: ' + res.message)
  }
}

const showSeatPDF = async () => {
  ElMessage.success('正在打开座位分布图...')
  try {
    const pdfName = 'seat.pdf';
    await window.api.invoke('open-pdf', pdfName);
  } catch (error) {
    console.error('Failed to open PDF:', error);
    ElMessage.error('无法打开座位分布图');
  }
}

const getNowResvDetail = async () => {
  const res = await window.api.invoke('task:load')
  if (res.success && res.data) {
    showNowResvDetail.value = true
    taskStuId.value = res.data.stuId
    taskCreateTime.value = res.data.createdAt
    taskSeatNameList.value = res.data.seatList.map(seat => seat.name).join(', ')
    lastResvResult.value = res.data.result || ''
    lastResvLog.value = res.log ? res.log.replace(/\n/g, '<br/>') : ''
  } else {
    showNowResvDetail.value = false
  }
}

onMounted(() => {
  getNowResvDetail()
})
</script>

<template>
  <div class="reservation-container">
    <!-- 新增预约任务 -->
    <el-card class="resv-card">
      <template #header>
        <div class="card-header">
          <el-tag v-if="userStore.userInfo.credit < 100" type="danger">信用分不足，无法预约座位哦</el-tag>
          <h3 style="padding-top: 5px">新增预约任务</h3>
          <span class="subtitle">在此选取座位后，每天将自动预约</span>
        </div>
      </template>

      <!-- 座位预选列表 -->
      <el-alert v-if="showResvSelectList" title="座位预选列表（预约优先级: 从左到右）" type="info" :closable="false" show-icon>
        <div style="color: rgba(2, 0, 255, 0.95);font-size: 18px;">{{ resvSeatNameList.join(', ') }}</div>
        <el-button @click="clearResvSeatList" size="small" type="danger" style="margin-top: 10px;">
          清空预选座位列表
        </el-button>
      </el-alert>

      <!-- 座位搜索 -->
      <el-input v-model="resvSeatInput" placeholder="请输入后三位数字" clearable @input="handleResvSeatInput"
        style="margin-top: 15px;">
        <template #prepend>座位编号:</template>
      </el-input>

      <!-- 搜索结果 -->
      <el-table v-if="resvSeatList.length > 0" :data="resvSeatList" style="width: 100%; margin-top: 20px;">
        <el-table-column prop="seat.seat_name" label="座位号" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button @click="handleResvSeatSelect(scope.row)" type="primary" size="small">添加预选</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="submitResvList" type="primary" plain>提交预约任务</el-button>
        <el-button @click="showSeatPDF" type="info" plain>查看座位分布图</el-button>
        <el-button v-if="showNowResvDetail" @click="deleteResvList" type="danger">中止并删除预约任务</el-button>
      </div>
    </el-card>

    <!-- 当前预约任务 -->
    <el-card v-if="showNowResvDetail" class="resv-card">
      <template #header>
        <div class="card-header">
          <h3>当前预约任务</h3>
          <span class="subtitle">此处显示正在执行的预约任务</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="预约账户">{{ userStore.userInfo.logonName + ' ' + userStore.userInfo.trueName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ taskCreateTime }}</el-descriptions-item>
        <el-descriptions-item label="预约时段">
          <template v-if="userStore.userInfo.resv_start_time">
            {{ userStore.userInfo.resv_start_time + '~22:00（周五20:00结束）' }}
          </template>
          <template v-else>
            <span style="color: rgba(255, 0, 0, 0.808);">未设置，默认为8:00～22:00（周五20:00结束）</span>
          </template>
        </el-descriptions-item>
        <el-descriptions-item label="预选座位列表">{{ taskSeatNameList }}</el-descriptions-item>
      </el-descriptions>

      <div class="task-details">

        <template v-if="lastResvResult">
          <h4>任务执行结果</h4>
          <div v-html="lastResvResult" class="result-content"></div>
        </template>

        <template v-if="lastResvLog">
          <h4>任务执行日志</h4>
          <div v-html="lastResvLog" class="log-content"></div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.reservation-container {
  padding: 20px;
}

.resv-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  flex-direction: column;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.task-details {
  margin-top: 20px;
}

.task-details h4 {
  margin: 15px 0 10px;
  font-weight: bold;
}

.seat-list {
  color: #333;
  text-align: center;
  font-size: 14px;
}

.result-content,
.log-content {
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 5px;
}
</style>