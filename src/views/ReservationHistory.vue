<template>
  <div class="reservation-history">
    <el-card class="history-card">
      <template #header>
        <div class="card-header">
          <h3>历史预约记录</h3>
          <el-button @click="getMyResvList" type="primary" plain style="width: 20%; margin-right: 20px;">
            刷新
          </el-button>
        </div>
      </template>

      <el-table v-show="showMyResvList" :data="myResvList" :row-class-name="tableRowClassName" style="width: 100%;"
        border height="70vh">
        <el-table-column prop="resvDevInfoList[0].devName" label="座位号" width="100" fixed />
        <el-table-column label="状态" width="90">
          <template #default="scope">
            <el-tag :type="utils.resvStatusColor(scope.row.resvStatus)">
              {{ utils.resvStatus(scope.row.resvStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="180">
          <template #default="scope">
            {{ utils.timestampToTime(scope.row.resvBeginTime) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="180">
          <template #default="scope">
            {{ utils.timestampToTime(scope.row.resvEndTime) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="scope">
            {{ utils.timestampToTime(scope.row.gmtCreate) }}
          </template>
        </el-table-column>

        <el-table-column label="详细信息" fixed width="90">
          <template #default="scope">
            <el-button @click="getDetail" type="primary" size="small" :data-resv-id="scope.row.resvId">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <p class="note-text">* 暂仅支持查询3个月以内的预约记录</p>
    </el-card>
    <el-dialog v-model="showResvDetail" title="预约详情" width="80%">
      <el-table :data="resvDetailList" style="width: 100%;" border>
        <el-table-column prop="devName" label="座位号" width="100" />
        <el-table-column label="操作时间" width="180">
          <template #default="scope">
            {{ utils.timestampToTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作类型" width="120">
          <template #default="scope">
            {{ utils.optionType(scope.row.kind) }}
          </template>
        </el-table-column>
        <el-table-column label="操作设备">
          <template #default="scope">
            {{ utils.optionDev(scope.row.consoleKind) }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="closeResvDetail">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useUserStore } from '../stores/userStore';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const showMyResvList = ref(false);
const myResvList = ref([]);
const showResvDetail = ref(false);
const resvDetailList = ref([]);
const userStore = useUserStore();
// myResvList.value = window.api.invoke('getMyResvList');

const getMyResvList = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/get_resv_list');
    if (response.data.success) {
      console.log(response.data);
      // 修改这里，从 response.data 中提取 resv_list 数组
      myResvList.value = response.data.resv_list;
      showMyResvList.value = true;
      ElMessage.success('获取预约记录成功');
    } else {
      ElMessage.error('获取预约记录失败: ' + response.data.message);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('获取预约记录失败: ' + error.message);
  }
};

const tableRowClassName = ({ row, rowIndex }) => {
  // 获取预约状态
  const status = utils.resvStatus(row.resvStatus);

  // 基于状态的样式类
  let statusClass = '';
  statusClass = rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
  if (status === '使用中') {
    statusClass = 'success-row';
  } else if (['待签到', '暂离中'].includes(status)) {
    statusClass = 'warning-row';
  } else if (status === '已违约') {
    statusClass = 'danger-row';
  }

  // 返回组合的类名
  return statusClass;
}

const getDetail = (event) => {
  const resvId = event.currentTarget.dataset.resvId;
  showResvDetail.value = true;
  axios.get('http://localhost:3000/api/get_resv_detail', {
    params: {
      resvId: resvId
    }
  }).then(response => {
    if (response.data.success) {
      console.log(response.data);
      resvDetailList.value = response.data.resv_detail;
    } else {
      ElMessage.error('获取预约详情失败: ' + response.data.message);
    }
  }).catch(error => {
    console.error(error);
    ElMessage.error('获取预约详情失败: ' + error.message);
  });
};

const closeResvDetail = () => {
  showResvDetail.value = false;
};

onMounted(() => {
  // 如果用户已登录，则获取预约记录
  if (userStore.isLoggedIn) {
    getMyResvList();
  }
})

const utils = {
  resvStatus(type) {
    switch (parseInt(type)) {
      case 1027:
        return "预约成功 未开始";
      case 1217:
      case 5313:
        return "已结束";
      case 1093:
        return "使用中";
      case 3141:
        return "暂离中";
      case 1029:
        return "待签到";
      case 1153:
      case 1233:
      case 1169:
      case 5265:
      case 7377:
      case 5249:
        return "已违约";
      default:
        return "未知状态";
    }
  },
  resvStatusColor(type) {
    switch (parseInt(type)) {
      case 1027:
        return "warning";
      case 1217:
      case 5313:
        return "info";
      case 1093:
        return "success";
      case 3141:
        return "primary";
      case 1029:
        return "danger";
      case 1153:
      case 1233:
      case 1169:
      case 5265:
      case 7377:
      case 5249:
        return "danger";
      default:
        return "info";
    }
  },
  timestampToTime(timestamp) {
    const date = new Date(timestamp);
    const Y = date.getFullYear().toString().substring(2) + '-';
    const M = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1) + '-';
    const D = (date.getDate() < 10 ? '0' : '') + date.getDate() + ' ';
    const h = (date.getHours() < 10 ? '0' : '') + date.getHours() + ':';
    const m = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':';
    const s = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    return Y + M + D + h + m + s;
  },
  optionType(type) {
    switch (parseInt(type)) {
      case 1:
        return "预约成功";
      case 2:
        return "已生效";
      case 4:
        return "已签到";
      case 8:
        return "暂离";
      case 16:
        return "暂离返回";
      case 32:
        return "已结束";
      case 64:
        return "预约结束后操作";
      case 128:
        return "已违约";
      default:
        return "未知状态";
    }
  },
  optionDev(type) {
    switch (parseInt(type)) {
      case 1:
        return "系统";
      case 2:
        return "二维码";
      case 4:
        return "手机";
      case 8:
        return "闸机";
      case 16:
        return "电脑";
      case 32:
        return "现场预约台";
      case 64:
        return "管理员";
      default:
        return "";
    }
  }
};
</script>

<style scoped>
.note-text {
  color: gray;
  font-size: 12px;
  margin: 10px auto 0;
  text-align: right;

}

.reservation-history {
  padding: 20px;
}

.history-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 浅色模式样式 */
.el-table :deep(.warning-row) {
  background-color: var(--el-color-warning-light-9) !important;
}

.el-table :deep(.success-row) {
  background-color: var(--el-color-success-light-9) !important;
}

.el-table :deep(.danger-row) {
  background-color: var(--el-color-danger-light-9) !important;
}
</style>