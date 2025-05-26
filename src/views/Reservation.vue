<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 数据定义
const resvSeatInput = ref('')
const resvSeatList = ref([])
const showResvSelectList = ref(false)
const resvSeatNameList = ref([])
const resvSeatIdList = ref([])

// 当前预约任务数据
const showNowResvDetail = ref(false)
const taskStuId = ref('')
const taskCreateTime = ref('')
const taskSeatNameList = ref('')
const lastResvResult = ref('')
const lastResvLog = ref('')
const user = ref({
  resv_start_time: '8:00'
})

// 方法定义
const handleResvSeatInput = (value) => {
  // 实现座位查询逻辑
  if (value && value.length >= 3) {
    // 模拟数据，实际应从API获取
    resvSeatList.value = [
      { seat_id: '1001', seat_name: 'A101' },
      { seat_id: '1002', seat_name: 'A102' },
      { seat_id: '1003', seat_name: 'A103' }
    ]
  } else {
    resvSeatList.value = []
  }
}

const handleResvSeatSelect = (seat) => {
  // 添加到预选列表
  if (!resvSeatIdList.value.includes(seat.seat_id)) {
    resvSeatIdList.value.push(seat.seat_id)
    resvSeatNameList.value.push(seat.seat_name)
    showResvSelectList.value = true
    ElMessage.success(`已添加座位 ${seat.seat_name} 到预选列表`)
  } else {
    ElMessage.warning(`座位 ${seat.seat_name} 已在预选列表中`)
  }
}

const clearResvSeatList = () => {
  resvSeatIdList.value = []
  resvSeatNameList.value = []
  showResvSelectList.value = false
  ElMessage.success('已清空预选座位列表')
}

const submitResvList = () => {
  if (resvSeatIdList.value.length === 0) {
    ElMessage.warning('请先添加预选座位')
    return
  }
  
  // 模拟提交成功
  ElMessage.success('预约任务提交成功')
  // 获取当前预约任务详情
  getNowResvDetail()
}

const deleteResvList = () => {
  // 模拟删除成功
  ElMessage.success('预约任务删除成功')
  showNowResvDetail.value = false
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

const getNowResvDetail = () => {
  // 模拟获取当前预约任务详情
  showNowResvDetail.value = true
  taskStuId.value = '2020001'
  taskCreateTime.value = '2023-06-01 10:00:00'
  taskSeatNameList.value = resvSeatNameList.value.join(', ')
  lastResvResult.value = '<p style="color:green">预约成功: A101</p>'
  lastResvLog.value = '<p>2023-06-01 08:00:00 开始执行预约任务</p><p>2023-06-01 08:00:05 尝试预约座位 A101</p><p>2023-06-01 08:00:10 预约成功</p>'
}

onMounted(() => {
  // 检查是否有现有预约任务
  // 模拟数据，实际应从API获取
  const hasExistingTask = false
  if (hasExistingTask) {
    getNowResvDetail()
  }
})
</script>

<template>
  <div class="reservation-container">
    <!-- 新增预约任务 -->
    <el-card class="resv-card">
      <template #header>
        <div class="card-header">
          <h3>新增预约任务</h3>
          <span class="subtitle">在此选取座位后，每天将自动预约</span>
        </div>
      </template>
      
      <!-- 座位预选列表 -->
      <el-alert
        v-if="showResvSelectList"
        title="座位预选列表"
        type="info"
        :closable="false"
        show-icon
      >
        <div>{{ resvSeatNameList.join(', ') }}</div>
        <el-button @click="clearResvSeatList" size="small" type="danger" style="margin-top: 10px;">
          清空预选座位列表
        </el-button>
      </el-alert>
      
      <!-- 座位搜索 -->
      <el-input
        v-model="resvSeatInput"
        placeholder="请输入后三位数字"
        clearable
        @change="handleResvSeatInput"
        style="margin-top: 15px;"
      >
        <template #prepend>座位编号:</template>
      </el-input>
      
      <!-- 搜索结果 -->
      <el-table
        v-if="resvSeatList.length > 0"
        :data="resvSeatList"
        style="width: 100%; margin-top: 20px;"
      >
        <el-table-column prop="seat_name" label="座位号" />
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
        <el-button v-if="showNowResvDetail" @click="deleteResvList" type="danger">删除预约任务</el-button>
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
        <el-descriptions-item label="预约账户">{{ taskStuId }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ taskCreateTime }}</el-descriptions-item>
        <el-descriptions-item label="预约时段">
          <template v-if="user.resv_start_time">
            {{ user.resv_start_time + '~22:00（周五20:00结束）' }}
          </template>
          <template v-else>
            <span style="color: rgba(255, 0, 0, 0.808);">未设置，默认为8:00～22:00（周五20:00结束）</span>
          </template>
        </el-descriptions-item>
      </el-descriptions>
      
      <div class="task-details">
        <h4>预选座位列表</h4>
        <div class="seat-list">{{ taskSeatNameList }}</div>
        
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

.result-content, .log-content {
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 5px;
}
</style>