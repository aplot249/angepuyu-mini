const CryptoJS = require('crypto-js');

// 必须与后端的 AES_SECRET_KEY 保持一致
const KEY_HEX = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16字节

const Encryption = {
  /**
   * 加密方法
   * @param {Object} data - 需要加密的 JSON 对象
   * @returns {String} - 包含 IV 的 Base64 密文
   */
  encrypt: function(data) {
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    
    // 1. 生成随机 IV (16字节)
    const iv = CryptoJS.lib.WordArray.random(16);
    
    // 2. 加密
    const encrypted = CryptoJS.AES.encrypt(data, KEY_HEX, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // 3. 拼接 IV + 密文 (注意：crypto-js 的 iv 和 ciphertext 都是 WordArray，需要处理)
    // 简单的做法：手动拼接 Hex 或 Base64。
    // 为了匹配 Python 的 base64(iv + ciphertext)，我们需要操作字节：
    
    const ivConcatCiphertext = iv.clone().concat(encrypted.ciphertext);
    return CryptoJS.enc.Base64.stringify(ivConcatCiphertext);
  },

  /**
   * 解密方法
   * @param {String} encryptedBase64 - 后端返回的 payload 字符串
   * @returns {Object} - 解密后的 JSON 对象
   */
  decrypt: function(encryptedBase64) {
    try {
      // 1. Base64 解码为 WordArray
      const rawData = CryptoJS.enc.Base64.parse(encryptedBase64);
      
      // 2. 提取 IV (前 16 字节 = 4 个 32位字)
      // clone() 很重要，否则 sigBytes 会被修改影响后续
      const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4), 16);
      
      // 3. 提取密文 (从第 16 字节开始)
      const ciphertext = CryptoJS.lib.WordArray.create(
        rawData.words.slice(4), 
        rawData.sigBytes - 16
      );
      
      // 4. 解密
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext },
        KEY_HEX,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedStr);
    } catch (e) {
      console.error("解密失败", e);
      return null;
    }
  }
};

export default Encryption;