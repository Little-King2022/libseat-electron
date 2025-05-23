// index.js
import Message from 'tdesign-miniprogram/message/index';
// 分享权限控制
wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
});
Page({
    // 自定义分享卡片
    onShareAppMessage() {
        return {
            title: '我发现了一个很好用的座位预约小程序，推荐给你～',
            path: 'pages/index/index',
        }
    },
    onReady() {
        const accountInfo = wx.getAccountInfoSync();
        this.setData({
            version: "Version: " + accountInfo.miniProgram.version
        });

        setTimeout(() => {
            if (wx.getStorageSync('isAuth') == 'true') {
                this.getLibNum();
                this.getResvNum();
                if (wx.getStorageSync('isLogin') == 'true') {
                    this.getMyInfo();
                }
            } else {
                setTimeout(() => {
                    if (wx.getStorageSync('isAuth') == 'true') {
                        this.getLibNum();
                        this.getResvNum();
                        if (wx.getStorageSync('isLogin') == 'true') {
                            this.getMyInfo();
                        }
                    }
                }, 2000);
            }
            this.setData({
                isLogin: wx.getStorageSync('isLogin'),
            });
            if (wx.getStorageSync('isLogin')) {
                this.getNowResvDetail();
            }
        }, 800);

        setTimeout(() => {
            this.fetchNotifications();
        }, 1000);

        setInterval(() => {
            if (wx.getStorageSync('isAuth') == 'true') {
                this.getLibNum();
                this.getResvNum();
            } else {
                wx.showToast({
                    title: '请重启小程序',
                    icon: 'error',
                    duration: '5000'
                })
            }
        }, 60000);

    },
    onShow(){
        this.setData({
            user: wx.getStorageSync('user_info'),
            resvDuration: wx.getStorageSync('user_info')['resv_start_time']?wx.getStorageSync('user_info')['resv_start_time'] + "~22:00":"暂未设置"
        })
    },

    data: {
        home_input_style: 'border: 3rpx solid rgba(220,220,220,1);border-radius: 16rpx;height:30rpx',
        showHelpInfoDlg: false,
        isHomeHidden: false,
        isResvHidden: true,
        isMyHidden: true,
        currentPage: 'home',
        inLibPercentage: 0,
        resvPercentage: 0,
        _2fnum: 0,
        _3fnum: 0,
        _4fnum: 0,
        _5fnum: 0,
        _6fnum: 0,
        _2fPer: 0,
        _3fPer: 0,
        _4fPer: 0,
        _5fPer: 0,
        _6fPer: 0,
        _7fPer: 0,
        resvCount: 0,
        freeCount: 0,
        inLibCount: 0,
        remainCount: 0,
        isPopupHidden: false,
        isVipPopupHidden: false,
        loginType0: false,
        loginType1: true,
        loginType2: true,
        stu_id: "",
        stu_phone: "",
        stu_pwd: "",
        checkLoginPwdTips: "默认密码为njfu+身份证后6位+!",
        showMyResvList: true,
        haveNotifi: false,
        isResvSeatPickerHidden: true,
        resvSeatNameList: [],
        resvSeatIdList: [],
        showResvSelectList: false,
        taskStuId: "",
        taskSeatNameList: "",
        taskCreateTime: "",
        showNowResvDetail: false,
        isIOS: wx.getStorageSync('isIOS'),
        user: {},
        resvDuration: wx.getStorageSync('user_info')['resv_start_time']?wx.getStorageSync('user_info')['resv_start_time'] + "~22:00":"暂未设置",
        version: "mp0.0.0"
    },
    methods: {

    },

    showRequestSubscribeMessage() {
        if (this.data.isLogin == "true") {
            // 计算偏移量
            const navigationBarHeight = wx.getSystemInfoSync().statusBarHeight + 110 + 'rpx';
            Message.info({
                context: this,
                offset: [navigationBarHeight, 20],
                icon: 'notification-filled',
                content: '若您需要接收“预约成功”和“签到成功”的通知，请先点击右侧按钮授权',
                marquee: {
                    speed: 70,
                    loop: -1,
                    delay: 0
                },
                duration: 30000,
                closeBtn: true,
                link: {
                    content: '点击订阅通知',
                    navigatorProps: {
                        url: '/pages/requestSubscribe/index',
                    },
                },
            });
        } else {
            this.setData({
                isPopupHidden: true,
            })
        };

    },
    // 服务器拉取通知
    fetchNotifications() {
        const that = this;
        wx.request({
            url: 'https://libseat.littleking.site/wxapi/get_notifi',
            method: 'GET',
            success(res) {
                if (res.statusCode === 200) {
                    const count = res.data['count']
                    if (count > 0) {
                        const notifications = res.data['notifications'];
                        for (var i = 0; i < count; i++) {
                            const id = notifications[i]['id'];
                            if (wx.getStorageSync(id)) {
                                continue;
                            } else {
                                that.setData({
                                    haveNotifi: true
                                });
                                wx.setStorageSync('notifications', notifications[i]);
                                that.showMessage(notifications[i]['title']);
                                break;
                            }
                        }
                    }
                }
            },
            fail(err) {
                console.error('Failed to fetch notifications:', err);
            }
        });
    },
    showMessage(content) {
        const navigationBarHeight = wx.getSystemInfoSync().statusBarHeight + 110 + 'rpx';
        Message.info({
            context: this,
            offset: [navigationBarHeight, 20],
            icon: 'notification-filled',
            content: content,
            marquee: {
                speed: 70,
                loop: -1,
                delay: 0
            },
            duration: 30000,
            closeBtn: true,
            link: {
                content: '查看通知',
                navigatorProps: {
                    url: '/pages/showNotifi/index',
                },
            },
        });
    },
    // 跳转到详细通知页面
    navigateToNotifiDetail(notification) {
        wx.navigateTo({
            url: '/pages/showNotifi/index',
        });
    },
    changePages(e) {
        if (e.detail.value == 'home') {
            this.setData({
                isHomeHidden: false,
                isResvHidden: true,
                isMyHidden: true,
                currentPage: 'home',
            });
        }
        if (e.detail.value == 'resv') {
            if (wx.getStorageSync('isLogin') == "true") {
                if (this.data.user.is_vip) {
                    this.getNowResvDetail();
                    this.setData({
                        isHomeHidden: true,
                        isResvHidden: false,
                        isMyHidden: true,
                        currentPage: 'resv',
                    });
                } else {
                    this.setData({
                        isVipPopupHidden: true
                    })
                }

            } else {
                this.needLogin();
            }
        }
        if (e.detail.value == 'my') {
            this.setData({
                isHomeHidden: true,
                isResvHidden: true,
                isMyHidden: false,
                currentPage: 'my',
            });
        }
    },
    needLogin() {
        this.setData({
            isPopupHidden: true
        })
    },
    jumpToLogin() {
        this.setData({
            isPopupHidden: false,
            isHomeHidden: true,
            isResvHidden: true,
            isMyHidden: false,
            currentPage: 'my',
        });
    },
    jumpToSubscribeNotifi() {
        wx.navigateTo({
            url: '/pages/barkSubscribe/index',
        });
    },
    jumpToSetResvDuration() {
        wx.navigateTo({
            url: '/pages/setResvDuration/index',
        });
    },
    // 登录区
    onLoginTabsClick(e) {
        this.setData({
            checkLoginIdTips: "",
            checkLoginPhoneTips: "",
            checkLoginIdStatus: "",
            checkLoginPhoneStatus: "",
            checkLoginPwdStatus: ""
        })
        if (e.detail.value == "0") {
            this.setData({
                loginType0: false,
                loginType1: true,
                loginType2: true,
            })
        } else if (e.detail.value == "1") {
            this.setData({
                loginType0: true,
                loginType1: false,
                loginType2: true,
            })

        } else {
            this.setData({
                loginType0: true,
                loginType1: true,
                loginType2: false,
            })
        };
    },
    checkLoginId(e) {
        var stu_id = e.detail.value;
        if (stu_id.length <= 12 && stu_id.length >= 9) {
            if (this.data.loginType1) {
                this.setData({
                    checkLoginIdStatus: "check-circle",
                    stu_id: stu_id,
                });
            } else {
                wx.request({
                    url: 'https://libseat.littleking.site/wxapi/check_login_id',
                    method: 'POST',
                    header: {
                        'content-type': 'application/json',
                        'Cookie': wx.getStorageSync('auth_cookie')
                    },
                    data: {
                        'stu_id': stu_id,
                    },
                    dataType: 'json',
                    success: (res) => {
                        if (res.data['result'] == 'success') {
                            this.setData({
                                checkLoginIdStatus: "check-circle",
                                checkLoginIdTips: "验证成功，绑定的手机尾号为：" + res.data['data'],
                                stu_id: stu_id,
                            });
                        } else {
                            this.setData({
                                checkLoginIdStatus: "error-circle",
                                checkLoginIdTips: "此账户未绑定过手机号，请使用右侧登录方式",
                                stu_id: stu_id,
                            });
                        }
                    },
                    fail: (res) => {
                        wx.showToast({
                            title: '网络异常',
                            icon: 'error',
                            duration: 3000
                        })
                    }
                })
            }
        } else {
            this.setData({
                checkLoginIdStatus: "error-circle",
                checkLoginIdTips: "学号格式错误",
            })
        }
    },
    checkLoginPhone(e) {
        var stu_phone = e.detail.value;
        if (/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(stu_phone)) {
            this.setData({
                checkLoginPhoneStatus: "check-circle",
                checkLoginPhoneTips: "",
                stu_phone: stu_phone,
            })
        } else {
            this.setData({
                checkLoginPhoneStatus: "error-circle",
                checkLoginPhoneTips: "手机号格式错误",
            })
        }
    },
    checkLoginPwd(e) {
        var stu_pwd = e.detail.value;
        stu_pwd = stu_pwd.replace("！", "!");
        if (stu_pwd == "") {
            this.setData({
                checkLoginPwdStatus: "error-circle",
                checkLoginPwdTips: "默认密码为njfu+身份证后6位+!",
            })
        } else {
            this.setData({
                checkLoginPwdStatus: "check-circle",
                stu_pwd: stu_pwd
            })
        }
    },
    getLoginCode(callback) {
        wx.login({
            success(res) {
                if (res.code) {
                    callback(res.code); // 调用回调函数，将 code 作为参数传递
                } else {
                    wx.showToast({
                        title: '请稍后重试',
                        icon: 'error',
                        duration: 1000
                    });
                    callback(false); // 调用回调函数，传递 false 表示失败
                }
            }
        });
    },
    login() {
        wx.showLoading({
            title: '请稍后',
        });
        if (wx.getStorageSync('auth_cookie') == '') {
            wx.showToast({
                title: '请重启小程序',
                duration: 3000,
                icon: 'error'
            });
            return false;
        }
        this.getLoginCode((wxcode) => { // 调用 getLoginCode，并传入一个回调函数
            // 微信一键登录
            if (!this.data.loginType0 && this.data.loginType1 && this.data.loginType2) {
                wx.request({
                    url: 'https://libseat.littleking.site/wxapi/wxmplogin',
                    method: 'POST',
                    header: {
                        'content-type': 'application/json',
                        'Cookie': wx.getStorageSync('auth_cookie')
                    },
                    data: {
                        'login_type': "wx",
                        'wxcode': wxcode,
                    },
                    dataType: 'json',
                    success: (res) => {
                        if (res.data['result'] == 'success' && (res.data['token']).length == 22) {
                            this.setData({
                                isLogin: "true",
                            });
                            wx.setStorageSync('isLogin', "true");
                            wx.setStorageSync('login_stu_id', res.data['stu_id']);
                            wx.setStorageSync('token', res.data['token']);
                            wx.showToast({
                                title: '登录成功',
                                duration: 1000,
                                icon: 'success'
                            });
                        } else {
                            wx.showToast({
                                title: '登录失败',
                                duration: 3000,
                                icon: 'error'
                            });
                        }
                    },
                    fail: (res) => {
                        wx.showToast({
                            title: '网络异常',
                            icon: 'error',
                            duration: 3000
                        })
                    }
                })

            }
            // 手机号登录
            else if (this.data.loginType0 && !this.data.loginType1 && this.data.loginType2) {
                var stu_id = this.data.stu_id;
                var stu_phone = this.data.stu_phone;
                if ((stu_id.length <= 12 && stu_id.length >= 9) && (stu_phone.length == 11) && wxcode) {
                    wx.request({
                        url: 'https://libseat.littleking.site/wxapi/wxmplogin',
                        method: 'POST',
                        header: {
                            'content-type': 'application/json',
                            'Cookie': wx.getStorageSync('auth_cookie')
                        },
                        data: {
                            'login_type': "phone",
                            'wxcode': wxcode,
                            'stu_id': stu_id,
                            'stu_phone': stu_phone
                        },
                        dataType: 'json',
                        success: (res) => {
                            if (res.data['result'] == 'success' && (res.data['token']).length == 22) {
                                this.setData({
                                    isLogin: "true"
                                });
                                wx.setStorageSync('isLogin', "true");
                                wx.setStorageSync('login_stu_id', res.data['stu_id']);
                                wx.setStorageSync('token', res.data['token']);
                                wx.showToast({
                                    title: '登录成功',
                                    duration: 1000,
                                    icon: 'success'
                                });
                            } else {
                                wx.showToast({
                                    title: '登录失败',
                                    duration: 3000,
                                    icon: 'error'
                                });
                            }
                        },
                        fail: (res) => {
                            wx.showToast({
                                title: '网络异常',
                                icon: 'error',
                                duration: 3000
                            })
                        }
                    })
                } else {
                    wx.showToast({
                        title: '数据校验失败',
                        icon: 'error',
                        duration: 3000
                    });
                    this.setData({
                        stu_id: "",
                        stu_phone: "",
                        stu_pwd: "",
                        checkLoginIdTips: "",
                        checkLoginPhoneTips: "",
                        checkLoginIdStatus: "",
                        checkLoginPhoneStatus: "",
                        checkLoginPwdStatus: ""
                    })
                }
            }
            // 密码登录
            else if (this.data.loginType0 && this.data.loginType1 && !this.data.loginType2) {
                var stu_id = this.data.stu_id;
                var stu_pwd = this.data.stu_pwd;
                if ((stu_id.length <= 12 && stu_id.length >= 9) && (stu_pwd.length > 0) && wxcode) {
                    wx.request({
                        url: 'https://libseat.littleking.site/wxapi/wxmplogin',
                        method: 'POST',
                        header: {
                            'content-type': 'application/json',
                            'Cookie': wx.getStorageSync('auth_cookie')
                        },
                        data: {
                            'login_type': "pwd",
                            'wxcode': wxcode,
                            'stu_id': stu_id,
                            'stu_pwd': stu_pwd
                        },
                        dataType: 'json',
                        success: (res) => {
                            if (res.data['result'] == 'success' && (res.data['token']).length == 22) {
                                this.setData({
                                    isLogin: "true"
                                });
                                wx.setStorageSync('isLogin', "true");
                                wx.setStorageSync('login_stu_id', res.data['stu_id']);
                                wx.setStorageSync('token', res.data['token']);
                                wx.showToast({
                                    title: '登录成功',
                                    duration: 1000,
                                    icon: 'success'
                                });
                            } else {
                                wx.showToast({
                                    title: '密码错误',
                                    duration: 3000,
                                    icon: 'error'
                                });
                            }
                        },
                        fail: (res) => {
                            wx.showToast({
                                title: '网络异常',
                                icon: 'error',
                                duration: 3000
                            })
                        }
                    })
                } else {
                    wx.showToast({
                        title: '数据校验失败',
                        icon: 'error',
                        duration: 3000
                    });
                    this.setData({
                        stu_id: "",
                        stu_phone: "",
                        stu_pwd: "",
                        checkLoginIdTips: "",
                        checkLoginPhoneTips: "",
                        checkLoginIdStatus: "",
                        checkLoginPhoneStatus: "",
                        checkLoginPwdStatus: ""
                    })
                }
            } else {
                wx.showToast({
                    title: '请重启小程序',
                    icon: 'error',
                    duration: 3000
                });
            }
            setTimeout(() => {
                if (wx.getStorageSync('isLogin') == "true") {
                    this.getMyResvList();
                }
            }, 2500)
            setTimeout(() => {
                if (wx.getStorageSync('isLogin') == "true") {
                    this.getMyInfo();
                }
            }, 1200)
        });
    },
    logout() {
        wx.setStorageSync('isLogin', "false");
        wx.removeStorageSync('login_stu_id');
        wx.removeStorageSync('token');
        wx.removeStorageSync('barkToken');
        wx.removeStorageSync('isVip');
        wx.removeStorageSync('user_info');
        this.setData({
            isLogin: "false",
            nickName: "",
            showMyResvList: true,
            taskCreateTime: null,
            taskSeatNameList: null,
            taskSeatNameList: null,
            taskStuId: null,
            user: null,
            lastResvLog: null
        });
        wx.showToast({
            title: '注销成功',
            duration: 1000
        });
    },





    onPopupVisibleChange(e) {
        this.setData({
            isPopupHidden: e.detail.visible,
        });
    },
    onVIPPopupVisibleChange(e) {
        this.setData({
            isVipPopupHidden: e.detail.visible,
        });
    },

    showHelpInfo() {
        this.setData({
            isVipPopupHidden: false,
            showHelpInfoDlg: true,
        });
    },
    closeHelpInfo() {
        this.setData({
            showHelpInfoDlg: false,
        });
    },
    getLibNum() {
        if (wx.getStorageSync('isAuth') == "true") {
            wx.request({
                url: 'https://libseat.littleking.site/wxapi/get_inlibnum',
                method: 'GET',
                contentType: 'application/json',
                header: {
                    'Cookie': wx.getStorageSync('auth_cookie')
                },
                success: (res) => {
                    try {
                        res = res.data;
                        if (res.result == "success"){
                            this.setData({
                                inLibPercentage: (res.current_count / 50).toFixed(0),
                                inLibCount: res.current_count,
                                remainCount: res.remaining_count,
                            });
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            })
        };
    },
    getResvNum() {
        if (wx.getStorageSync('isAuth') == "true") {
            wx.request({
                url: 'https://libseat.littleking.site/wxapi/get_all_resv',
                method: 'GET',
                header: {
                    'Cookie': wx.getStorageSync('auth_cookie')
                },
                contentType: "application/json",
                success: (res) => {
                    if (res['data']['result'] == 'success') {
                        this.setData({
                            'resvCount': res['data']['resvnum'],
                            'freeCount': res['data']['freenum'],
                            'resvPercentage': (100 - res['data']['freerate']).toFixed(0)
                        })
                    }
                }

            })
            for (let i = 2; i <= 7; i++) {
                wx.request({
                    url: 'https://libseat.littleking.site/wxapi/get_room_resv/' + i,
                    method: 'GET',
                    contentType: 'application/json',
                    header: {
                        'Cookie': wx.getStorageSync('auth_cookie')
                    },
                    success: (res) => {
                        if (res['data']['result'] == 'success') {
                            this.setData({
                                ['_' + i + 'fnum']: res['data']['freenum'],
                                ['_' + i + 'fPer']: parseInt(100 - res['data']['freerate']),
                            });
                        }
                    }
                })
            }
        };
    },

    // 座位查询输入框
    bindSeatInput(e) {
        if (e.detail.value == '' || e.detail.value == ' ') {
            this.setData({
                isSeatPickerHidden: true,
            })
        } else {
            this.setData({
                isSeatPickerHidden: false,
            })
        }
        wx.request({
            url: 'https://libseat.littleking.site/wxapi/search_seat_by_name',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            data: {
                'query': e.detail.value
            },
            dataType: 'json',
            success: (res) => {
                var seatList = res['data']['results']
                this.setData({
                    seatList: seatList
                })
            }
        })
    },
    // 学生查询输入框
    bindStuInput(e) {
        if (e.detail.value == '' || e.detail.value == ' ') {
            this.setData({
                isStuPickerHidden: true,
            })
        } else {
            this.setData({
                isStuPickerHidden: false,
            })
        }
        wx.request({
            url: 'https://libseat.littleking.site/wxapi/search_stu',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            data: {
                'query': e.detail.value
            },
            dataType: 'json',
            success: (res) => {
                var stuList = res['data']['stu_list']
                this.setData({
                    stuList: stuList
                })
            }
        })
    },

    bindSeatSelect(e) {
        if (wx.getStorageSync('isLogin') == "true") {
            var seat = e.target.dataset.item;
            wx.navigateTo({
                url: '/pages/seat/index?seat=' + seat,
            })
        } else {
            this.needLogin();
        }

    },
    bindStuSelect(e) {
        if (wx.getStorageSync('isLogin') == "true") {

            var stu_id = (e.target.dataset.item).match(/.*\d+/g);
            wx.navigateTo({
                url: '/pages/stu/index?stu_id=' + stu_id,
            })
        } else {
            this.needLogin();
        }
    },



    // resv页面
    // 预约页面座位查询输入框
    bindResvSeatInput(e) {
        if (e.detail.value == '' || e.detail.value == ' ') {
            this.setData({
                isResvSeatPickerHidden: true,
            })
        } else {
            this.setData({
                isResvSeatPickerHidden: false,
            })
        }
        wx.request({
            url: 'https://libseat.littleking.site/wxapi/search_seat_v2',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            data: {
                'seat_name': e.detail.value
            },
            dataType: 'json',
            success: (res) => {
                var seatList = res['data']
                this.setData({
                    resvSeatList: seatList
                })
            }
        })
    },
    bindResvSeatSelect(e) {
        this.setData({
            showResvSelectList: true
        })
        if (wx.getStorageSync('isLogin') == "true") {
            // 检查当前座位数是否已经超过 5 个
            if (this.data.resvSeatNameList.length >= 5) {
                wx.showToast({
                    title: '最多只能选择5个座位',
                    icon: 'none'
                });
                return; // 阻止继续执行
            }
            var seat = e.target.dataset.item;
            // 使用 push 方法向数组添加元素
            this.setData({
                resvSeatNameList: [...this.data.resvSeatNameList, seat.seat_name],
                resvSeatIdList: [...this.data.resvSeatIdList, seat.seat_id]
            });
        } else {
            this.needLogin();
        }
    },
    clearResvSeatList(a) {
        // 清空已选择的座位列表
        this.setData({
            resvSeatNameList: [],
            resvSeatIdList: [],
            showResvSelectList: false
        });
        if (a) {
            return;
        }
        wx.showToast({
            title: '座位列表已清空',
            icon: 'none'
        });
    },
    submitResvList() {
        // 确保 resvSeatIdList 数组不为空
        if (this.data.resvSeatIdList.length === 0) {
            wx.showToast({
                title: '请至少选择一个座位',
                icon: 'none'
            });
            return; // 阻止提交
        }

        // 要提交的数据
        var dataToSend = {
            seat_ids: this.data.resvSeatIdList,
            stu_id: wx.getStorageSync('login_stu_id')
        };

        // 发送请求到服务器
        wx.request({
            url: 'https://libseat.littleking.site/wxapi/submit_auto_appo', // 服务器URL
            method: 'POST',
            data: JSON.stringify(dataToSend),
            header: {
                'content-type': 'application/json',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            success: (res) => {
                if (res.data === "success") {
                    this.getNowResvDetail();
                    wx.showToast({
                        title: '提交成功',
                        icon: 'success'
                    });
                    // 清空列表
                    this.clearResvSeatList(true);
                    this.setData({
                        isResvSeatPickerHidden: true,
                        showResvSelectList: false
                    })
                } else {
                    wx.showToast({
                        title: '数据校验失败',
                        icon: 'none'
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    title: '网络异常',
                    icon: 'none'
                });
            }
        });
    },
    deleteResvList() {
        wx.showModal({
            title: '提示',
            content: '确定删除预约任务吗？',
            complete: (res) => {
                if (res.cancel) {
                    return;
                }
                if (res.confirm) {
                    wx.request({
                        url: 'https://libseat.littleking.site/wxapi/delete_auto_appo', // 服务器URL
                        method: 'GET',
                        header: {
                            'content-type': 'application/json',
                            'Cookie': wx.getStorageSync('auth_cookie')
                        },
                        success: (res) => {
                            if (res.data === "success") {
                                this.getNowResvDetail();
                                wx.showToast({
                                    title: '删除成功',
                                    icon: 'success'
                                });
                                this.setData({
                                    showNowResvDetail: false
                                })
                            } else {
                                wx.showToast({
                                    title: '删除失败，请重试',
                                    icon: 'none'
                                });
                            }
                        },
                        fail: () => {
                            wx.showToast({
                                title: '网络异常',
                                icon: 'none'
                            });
                        }
                    });
                }
            }
        })
    },
    getNowResvDetail() {
        wx.request({
            url: 'https://libseat.littleking.site/wxapi/get_now_resv_list',
            method: 'GET',
            header: {
                'content-type': 'application/json',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            success: (res) => {
                if (res.data.result === "success") {
                    var data = res.data.data;

                    // 格式化 seat_name_list 数组为字符串
                    var formattedSeatNameList = data['seat_name_list'] ? data['seat_name_list'].join(', ') : '无座位';

                    // 将 create_time 转换为北京时间
                    var formattedCreateTime = '无时间';
                    if (data['create_time']) {
                        // 假设 create_time 是时间戳，单位为毫秒
                        let createTime = new Date(data['create_time']);
                        // 手动调整为北京时间（UTC+8）
                        createTime.setHours(createTime.getHours() - 8);
                        formattedCreateTime = createTime.toLocaleString(); // 输出为当地格式
                    }
                    var resv_log = data['tips'];
                    let newText = resv_log.replace(/\n/g, "<br><br>");

                    // 将格式化后的数据设置到页面上
                    this.setData({
                        taskStuId: String(data['stu_id'] || '无学号'),
                        taskSeatNameList: formattedSeatNameList,
                        taskCreateTime: formattedCreateTime,
                        showNowResvDetail: true,
                        lastResvResult: data['result'],
                        lastResvLog: newText
                    });
                }
            },
        });
    },
    // 展示图书馆座位图pdf
    showSeatPDF() {
        const fs = wx.getFileSystemManager();
        const filePath = `${wx.env.USER_DATA_PATH}/seat1.pdf`;

        wx.showLoading({
            title: '加载中',
            duration: 5000
        });

        // 检查文件是否已经存在
        fs.access({
            path: filePath,
            success: () => {
                // 文件已存在，直接打开
                wx.openDocument({
                    filePath: filePath,
                    showMenu: true,
                    success: function (res) {
                        console.log('打开缓存文档成功');
                    },
                    fail: function () {
                        console.log('打开缓存文档失败');
                    }
                });
            },
            fail: () => {
                // 文件不存在，重新下载
                wx.downloadFile({
                    url: 'https://libseat.littleking.site/static/seat1.pdf',
                    success: function (res) {
                        // 保存文件到本地
                        fs.saveFile({
                            tempFilePath: res.tempFilePath,
                            filePath: filePath,
                            success: function () {
                                wx.openDocument({
                                    filePath: filePath,
                                    showMenu: true,
                                    success: function () {
                                        console.log('打开文档成功');
                                    },
                                    fail: function () {
                                        console.log('打开文档失败');
                                    }
                                });
                            },
                            fail: function () {
                                console.log('保存文件失败');
                            }
                        });
                    },
                    fail: () => {
                        wx.showToast({
                            title: '网络异常',
                            icon: 'none'
                        });
                    }
                });
            }
        });
    },



    // my页面
    // 查询我的预约记录
    getMyResvList() {
        if (this.data.isLogin == "true") {
            this.setData({
                showMyResvList: true
            });
            wx.showLoading({
                title: '加载中',
            });
            wx.request({
                url: 'https://libseat.littleking.site/wxapi/get_my_resv_list',
                method: 'GET',
                header: {
                    'Cookie': wx.getStorageSync('auth_cookie')
                },
                dataType: 'json',
                success: (res) => {
                    if (res.data['result'] == 'success') {
                        this.setData({
                            myResvList: res.data['data'],
                            showMyResvList: false
                        });
                        wx.hideLoading();
                    } else if (res.data['result'] == 'zero') {
                        wx.showToast({
                            title: '没有预约记录',
                            icon: 'error',
                            duration: 2000,
                        })
                    } else {
                        this.getMyResvList()
                    }
                },
                fail: (res) => {
                    wx.showToast({
                        title: '网络异常',
                        icon: 'error',
                        duration: 3000,
                    })
                }
            })
        }
    },
    // 显示详细记录
    getDetail(res) {
        wx.showLoading({
            title: '加载中',
            mask: true
        });

        var resvid = res.detail.currentTarget.dataset.custom;
        var that = this;
        wx.request({
            url: "https://libseat.littleking.site/wxapi/get_resv_info/" + resvid,
            method: "GET",
            dataType: "json",
            header: {
                'content-type': 'application/json',
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            success: function (res) {
                var data = JSON.parse(res.data);
                if (data.message == '查询成功') {
                    var jsonData = data.data;
                    that.setData({
                        resvDetailList: jsonData,
                        showResvDetail: true,
                    });
                    wx.hideLoading();
                } else {
                    wx.showToast({
                        title: '请求失败',
                        icon: 'error'
                    });
                }
            },
            fail: function () {
                wx.showToast({
                    title: '网络异常',
                    icon: 'error'
                });
            }
        });
    },
    // 关闭详细记录对话框
    closeResvDetail() {
        this.setData({
            showResvDetail: false,
        })
    },
    // 转到小程序评论
    showComment() {
        var plugin = requirePlugin("wxacommentplugin");
        plugin.openComment({
            success: (res) => {
                wx.showModal({
                    title: '评价成功',
                    content: '每30天可评价一次，感谢您的评价',
                })
            },
            fail: (res) => {
                wx.showToast({
                    title: '评价失败',
                    icon: 'error',
                    duration: 3000
                })
            }
        })
    },
    // 请求个人信息
    getMyInfo() {
        wx.request({
            url: 'https://libseat.littleking.site/wxapi/get_user_info',
            method: 'GET',
            header: {
                'Cookie': wx.getStorageSync('auth_cookie')
            },
            dataType: 'json',
            success: (res) => {
                if (res.statusCode == 200) {
                    this.setData({
                        user: res.data,
                    });
                    wx.setStorageSync('user_info', res.data)
                    wx.setStorageSync('barkToken', res.data.bark_token)
                    
                } else {
                    wx.showToast({
                        title: '获取用户失败',
                        duration: 3000,
                        icon: 'error'
                    });
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: '网络异常',
                    icon: 'error',
                    duration: 3000
                })
            }
        })
    },
    showAutoSignInfo(){
        wx.showToast({
            title: '自动签到默认开启，系统将全天自动为您签到',
            icon: 'none',
            duration: 5000
        });
    }
})