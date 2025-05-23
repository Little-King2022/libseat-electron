<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 数据定义
const seatNumber = ref('')
const studentInfo = ref('')
const seatList = ref([])
const stuList = ref([])

// 统计数据
const inLibCount = ref(0)
const remainCount = ref(0)
const resvCount = ref(0)
const freeCount = ref(0)
const inLibPercentage = ref(0)
const resvPercentage = ref(0)
const _2fPer = ref(0)
const _3fPer = ref(0)
const _4fPer = ref(0)
const _5fPer = ref(0)
const _6fPer = ref(0)
const _7fPer = ref(0)

// 方法定义
const handleSeatInput = async () => {
  if (seatNumber.value && seatNumber.value.length >= 3) {
    try {
      const result = await window.api.searchSeatByName(seatNumber.value)
      console.log('查询结果:', result)
      seatList.value = result.map(seat => ({ seat }))
    } catch (error) {
      console.error('查询座位信息失败:', error)
      ElMessage.error('查询失败，请检查本地数据库连接')
      seatList.value = []
    }
  } else {
    seatList.value = []
  }
}

const handleStuInput = (value) => {
  // 实现学生查询逻辑
  if (value && value.length >= 2) {
    // 模拟数据，实际应从API获取
    stuList.value = ['张三 2020001', '李四 2020002']
  } else {
    stuList.value = []
  }
}

const handleSeatSelect = (seat) => {
  // 处理座位选择
  console.log('选择座位:', seat.seat.seat_name)
  ElMessage.info(`你选择了座位：${seat.seat.seat_name}`)
}

const handleStuSelect = (student) => {
  // 处理学生选择
  console.log('选择学生:', student)
}

// 获取图书馆数据
const getLibraryData = () => {
  // 模拟数据，实际应从API获取
  inLibCount.value = 320
  remainCount.value = 180
  resvCount.value = 450
  freeCount.value = 50
  inLibPercentage.value = 64
  resvPercentage.value = 90
  _2fPer.value = 85
  _3fPer.value = 75
  _4fPer.value = 60
  _5fPer.value = 45
  _6fPer.value = 30
  _7fPer.value = 20
}

onMounted(() => {
  getLibraryData()
  // 设置定时刷新
  setInterval(() => {
    getLibraryData()
  }, 60000)
})
</script>

<template>
  <div class="home-container">
    <!-- 座位查询部分 -->
    <el-card class="query-card">
      <template #header>
        <div class="card-header">
          <h3>座位查询</h3>
          <span class="subtitle">座位签到、查询座位使用记录、当前使用者</span>
        </div>
      </template>
      <el-input
        v-model="seatNumber"
        placeholder="请输入后三位数字"
        clearable
        @input="handleSeatInput"
      >
        <template #prepend>座位编号:</template>
      </el-input>
      
      <el-table
        v-if="seatList.length > 0"
        :data="seatList"
        style="width: 100%; margin-top: 20px;"
      >
        <el-table-column prop="seat.seat_name" label="座位号" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button @click="handleSeatSelect(scope.row)" type="primary" size="small">查询</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    

    <!-- 统计信息部分 -->
    <el-card class="stats-card">
      <el-row :gutter="20">
        <!-- 在馆人数和预约人数 -->
        <el-col :span="8">
          <div class="stats-block">
            <h4>在馆人数</h4>
            <p>当前在馆: {{ inLibCount }}</p>
            <p>剩余入馆: {{ remainCount }}</p>
            
            <h4 style="margin-top: 20px;">预约人数</h4>
            <p>当前预约: {{ resvCount }}</p>
            <p>剩余可用: {{ freeCount }}</p>
          </div>
        </el-col>
        
        <!-- 环形进度条 -->
        <el-col :span="4">
          <el-progress
            type="circle"
            :percentage="inLibPercentage"
            :width="80"
          />
          <el-progress
            type="circle"
            :percentage="resvPercentage"
            :width="80"
            style="margin-top: 20px;"
          />
        </el-col>
        
        <!-- 各楼层座位预约率 -->
        <el-col :span="12">
          <h4>各楼层座位预约率</h4>
          <div class="floor-stats">
            <div class="floor-item">
              <span>2楼</span>
              <el-progress 
                :percentage="_2fPer" 
                :status="_2fPer > 70 ? 'exception' : _2fPer > 50 ? 'warning' : 'success'"
              />
            </div>
            <div class="floor-item">
              <span>3楼</span>
              <el-progress 
                :percentage="_3fPer" 
                :status="_3fPer > 70 ? 'exception' : _3fPer > 50 ? 'warning' : 'success'"
              />
            </div>
            <div class="floor-item">
              <span>4楼</span>
              <el-progress 
                :percentage="_4fPer" 
                :status="_4fPer > 70 ? 'exception' : _4fPer > 50 ? 'warning' : 'success'"
              />
            </div>
            <div class="floor-item">
              <span>5楼</span>
              <el-progress 
                :percentage="_5fPer" 
                :status="_5fPer > 70 ? 'exception' : _5fPer > 50 ? 'warning' : 'success'"
              />
            </div>
            <div class="floor-item">
              <span>6楼</span>
              <el-progress 
                :percentage="_6fPer" 
                :status="_6fPer > 70 ? 'exception' : _6fPer > 50 ? 'warning' : 'success'"
              />
            </div>
            <div class="floor-item">
              <span>7楼</span>
              <el-progress 
                :percentage="_7fPer" 
                :status="_7fPer > 70 ? 'exception' : _7fPer > 50 ? 'warning' : 'success'"
              />
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped>
.home-container {
  padding: 20px;
}

.query-card {
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

.stats-card{
  margin-top: 50px;
}

.stats-block {
  padding: 10px;
}

.stats-block h4 {
  margin-bottom: 10px;
  font-weight: bold;
}

.stats-block p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.floor-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.floor-item {
  display: flex;
  align-items: center;
}

.floor-item span {
  width: 40px;
  text-align: right;
  margin-right: 10px;
}
</style>