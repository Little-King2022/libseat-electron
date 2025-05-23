import { ipcRenderer } from 'electron';

// API请求客户端
class ApiClient {
  async request(method, url, data) {
    try {
      const response = await ipcRenderer.invoke('api-request', {
        method,
        url,
        data,
      });
      return response;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // 获取在馆人数
  async getInLibNum() {
    return this.request('GET', '/api/get_inlibnum');
  }

  // 获取预约统计
  async getAllResv() {
    return this.request('GET', '/api/get_all_resv');
  }

  // 获取楼层预约情况
  async getRoomResv(floor) {
    return this.request('GET', `/api/get_room_resv/${floor}`);
  }

  // 座位搜索
  async searchSeatByName(query) {
    return this.request('POST', '/api/search_seat_by_name', { query });
  }

  // 学生搜索
  async searchStudent(query) {
    return this.request('POST', '/api/search_stu', { query });
  }

  // 用户登录
  async login(loginData) {
    return this.request('POST', '/api/login', loginData);
  }

  // 获取用户信息
  async getUserInfo() {
    return this.request('GET', '/api/get_user_info');
  }

  // 注销登录
  async logout() {
    return this.request('POST', '/api/logout');
  }
}

// 导出API客户端实例
export const api = new ApiClient();