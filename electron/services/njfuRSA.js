const crypto = require('crypto');

/**
 * 使用 crypto 模块将 PEM 格式的公钥转换为十六进制字符串
 * @param {string} pem 公钥的 PEM 格式字符串
 * @returns {string} 返回公钥的十六进制字符串
 */
function pemToHex(pem) {
    // 移除所有的换行符和PEM头尾
    const pemContent = pem
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/\n/g, '');
    
    // 将Base64字符串转换为二进制Buffer，再转为十六进制
    const publicKeyBytes = Buffer.from(pemContent, 'base64');
    return publicKeyBytes.toString('hex');
}


const { KJUR, RSAKey } = require('jsrsasign');

/**
 * 使用 jsrsasign 库对密码进行加密
 * @param {string} pwd 明文密码
 * @param {string} nonce 服务器返回的随机数
 * @param {string} publicKeyBase64 公钥字符串（PEM 格式或 Base64）
 * @returns {string|null} 返回加密后的字符串
 */
module.exports.encryptPwdNonce = function(pwd, nonce, publicKeyBase64) {
    if (!pwd || !nonce || !publicKeyBase64) return null;

    try {
        let pubKeyPEM;
        
        // 检查输入的公钥格式，如果已经是PEM格式则直接使用，否则转换为PEM格式
        if (publicKeyBase64.includes('-----BEGIN PUBLIC KEY-----')) {
            pubKeyPEM = publicKeyBase64;
        } else {
            pubKeyPEM = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;
        }

        // 使用 node.js 的 crypto 模块进行 RSA 加密
        const publicKey = crypto.createPublicKey(pubKeyPEM);
        const plaintext = `${pwd};${nonce}`;
        
        // 使用 RSA-OAEP 算法进行加密
        const encryptedBuffer = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_PADDING
            },
            Buffer.from(plaintext, 'utf8')
        );
        
        // 返回 Base64 编码的加密结果
        return encryptedBuffer.toString('base64');
    } catch (err) {
        console.error('[encryptPwdNonce] 加密失败:', err);
        return null;
    }
};


