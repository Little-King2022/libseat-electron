import { getSystemSetting, updateSystemSetting } from '../../electron/services/dbService.js';
import { encryptPwdNonce } from '../../electron/services/rsa.js';

export async function schoolLogin() {
    try {
        // 1. 获取学号和密码
        const systemSetting = await getSystemSetting();
        const stu_id = systemSetting.stu_id;
        const stu_pwd = systemSetting.stu_pwd;

        if (!stu_id || !stu_pwd) {
            console.error('学号或密码未设置');
            throw new Error('学号或密码未设置');
        }

        // 2. 获取公钥和nonce，并保存cookie
        const pkRes = await window.api.sendRequest({
            url: 'https://libseat.njfu.edu.cn/ic-web/login/publicKey',
            method: 'GET',
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
        });
        
        // 获取cookie
        const setCookie = pkRes.headers['set-cookie'];
        let cookie = '';
        if (setCookie && setCookie.length > 0) {
            cookie = setCookie[0].split(';')[0];
            console.log('cookie:', cookie);
        }

        if (!pkRes.data.data || !pkRes.data.data.publicKey || !pkRes.data.data.nonceStr) {
            console.error('获取公钥或nonce失败', pkRes.data);
            return;
        }
        const publicKey = pkRes.data.data.publicKey;
        const nonce = pkRes.data.data.nonceStr;

        // 3. 加密密码
        console.log(stu_pwd, nonce, publicKey)
        const encrypt_pwd = encryptPwdNonce(stu_pwd, nonce, publicKey);
        if (!encrypt_pwd) {
            console.error('密码加密失败');
            return;
        }

        // 4. 登录请求
        const loginRes = await window.api.sendRequest({
            url: 'https://libseat.njfu.edu.cn/ic-web/login/user',
            method: 'POST',
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
            },
            data: {
                logonName: stu_id,
                password: encrypt_pwd,
                captcha: "",
                privacy: "true",
                consoleType: 16
            }
        });

        // 5. 打印响应结果
        console.log('登录响应:', loginRes.data.data);

        // 6. 保存cookie到数据库
        if (loginRes.data.code === 0) {
            await updateSystemSetting({
                token: cookie,
                user_data: JSON.stringify(loginRes.data.data)
            });
            console.log('登录成功 cookie已保存到数据库');
        }

        return {
            "success": loginRes.data.code === 0,
            "data": loginRes.data.data,
            "message": loginRes.data.message
        }

    } catch (err) {
        console.error('登录过程发生错误:', err);
        return {
            "success": false,
            "message": err.message
        }
    }
}

// schoolLogin()