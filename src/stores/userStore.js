import { defineStore } from 'pinia'
import { ElMessage, ElLoading } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    userInfo: {
      stu_id: '',
      stu_name: '',
      credit: 600,
      stu_phone: '',
      resv_start_time: ''
    },
    systemSetting: null
  }),

  actions: {
    async tryAutoLogin() {
      try {
        // 获取系统设置
        const setting = await window.api.invoke('db:get-system-setting')
        this.systemSetting = setting

        // 如果有存储的账号密码，尝试自动登录
        if (setting?.stu_id && setting?.stu_pwd) {
          const loading = ElLoading.service({
            lock: true,
            text: '正在自动登录...',
            background: 'rgba(0, 0, 0, 0.7)',
          })

          try {
            const loginResult = await window.api.invoke('login')
            if (loginResult.success) {
              this.isLoggedIn = true
              this.userInfo = { ...this.userInfo, ...loginResult.data }
              ElMessage.success('自动登录成功')
              // 开启自动更新
              await window.api.invoke('start-auto-refresh')
            }
          } finally {
            loading.close()
          }
        }
      } catch (error) {
        console.error('自动登录失败:', error)
      }
    },

    async login(loginForm) {
      const loading = ElLoading.service({
        lock: true,
        text: '登录中...',
        background: 'rgba(0, 0, 0, 0.7)',
      })

      try {
        // 写入数据库
        await window.api.invoke('db:update-system-setting', {
          stu_id: loginForm.stu_id,
          stu_pwd: loginForm.stu_pwd
        })

        // 调用登录接口
        const loginResult = await window.api.invoke('login')

        if (loginResult.success) {
          ElMessage.success('登录成功')
          this.isLoggedIn = true
          this.userInfo = { ...this.userInfo, ...loginResult.data }
          // 开启自动更新
          await window.api.invoke('start-auto-refresh')
          return true
        } else {
          ElMessage.error(loginResult.message || '登录失败')
          return false
        }
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error('登录失败，请检查网络连接：' + error.message)
        if (error.message.includes('nonce')) {
          ElMessage({
            message: '请先连接到校园网或VPN',
            type: 'error',
            duration: 5000,
          })
        }
        return false
      } finally {
        loading.close()
      }
    },

    async logout() {
      try {
        // 停止自动更新
        await window.api.invoke('stop-auto-refresh')
        this.isLoggedIn = false
        this.userInfo = {
          stu_id: '',
          stu_name: '',
          credit: 600,
          stu_phone: '',
          resv_start_time: ''
        }
        ElMessage.success('注销成功')
      } catch (error) {
        console.error('停止自动更新失败:', error)
        ElMessage.error('注销过程出现错误')
      }
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user-store',
        storage: localStorage,
      },
    ],
  },
})