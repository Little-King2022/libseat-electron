// electron/services/loginManager.js
const axios = require('axios');
const { encryptPwdNonce } = require('./njfuRSA.js');
const { getSystemSetting, updateSystemSetting } = require('../services/dbService.js');

let refreshIntervalId = null;

async function fetchLoginPublicKeyAndNonce() {
    const res = await axios.get('https://libseat.njfu.edu.cn/ic-web/login/publicKey', {
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Host": "libseat.njfu.edu.cn",
            "Pragma": "no-cache",
            "Referer": "https://libseat.njfu.edu.cn/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
        }
    }).catch(err => {
        throw new Error('获取公钥和 nonce 失败');
    })
    ;

    const cookie = res.headers['set-cookie']?.[0]?.split(';')[0] || '';
    const { publicKey, nonceStr } = res.data.data || {};

    if (!publicKey || !nonceStr) throw new Error('无法获取公钥或 nonce');

    return { cookie, publicKey, nonceStr };
}

async function doLogin() {
    const setting = await getSystemSetting();
    const stu_id = setting.stu_id;
    const stu_pwd = setting.stu_pwd;

    if (!stu_id || !stu_pwd) throw new Error('学号或密码未设置');

    const { cookie, publicKey, nonceStr } = await fetchLoginPublicKeyAndNonce();
    // console.log(cookie, publicKey, nonceStr)
    const encryptedPwd = encryptPwdNonce(stu_pwd, nonceStr, publicKey);
    if (!encryptedPwd) throw new Error('密码加密失败');

    const loginRes = await axios.post(
        'https://libseat.njfu.edu.cn/ic-web/login/user',
        {
            logonName: stu_id,
            password: encryptedPwd,
            captcha: '',
            privacy: 'true',
            consoleType: 16,
        },
        {
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.9",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "application/json;charset=UTF-8",
                "Cookie": cookie,
                "Host": "libseat.njfu.edu.cn",
                "Origin": "https://libseat.njfu.edu.cn",
                "Pragma": "no-cache",
                "Referer": "https://libseat.njfu.edu.cn/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
                "lan": "1"
            }
        }
    );

    if (loginRes.data.code !== 0) {
        throw new Error(loginRes.data.message || '登录失败');
    }

    await updateSystemSetting({
        token: cookie,
        user_data: JSON.stringify(loginRes.data.data),
    });

    return {
        success: true,
        token: cookie,
        data: loginRes.data.data,
    };
}

function startAutoRefresh(intervalMs = 20 * 60 * 1000) {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
    }
    refreshIntervalId = setInterval(async () => {
        try {
            console.log('[Login] 正在自动刷新登录状态...');
            await doLogin();
            console.log('[Login] 登录续期成功');
        } catch (err) {
            console.error('[Login] 登录续期失败:', err);
        }
    }, intervalMs);
}

function stopAutoRefresh() {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
    }
}

async function getUserCredit() {
    const setting = await getSystemSetting();
    const cookie = setting.token;
    return axios.get('https://libseat.njfu.edu.cn/ic-web/creditPunishRec/surPlus', {
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Host": "libseat.njfu.edu.cn",
            "Pragma": "no-cache",
            "Referer": "https://libseat.njfu.edu.cn/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
            "Cookie": cookie,
        }
    }).then(res => {
        if (res.data.code !== 0) {
            throw new Error(res.data.message || '获取用户信用分失败');
        }
        return res.data.data;   
    })
}

module.exports = {
    doLogin,
    startAutoRefresh,
    stopAutoRefresh,
    getUserCredit
};