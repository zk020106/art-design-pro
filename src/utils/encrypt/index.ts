import { Base64 } from 'crypto-js/enc-base64'
import { Utf8 } from 'crypto-js/enc-utf8'
import { JSEncrypt } from 'jsencrypt'
import md5 from 'crypto-js/md5'
import CryptoJS from 'crypto-js'

/**
 * Base64编码
 * @param txt 待编码文本
 * @returns 编码后的文本
 */
export function encodeByBase64(txt: string) {
  return Utf8.parse(txt).toString(Base64)
}

/**
 * Base64解码
 * @param txt 待解码文本
 * @returns 解码后的文本
 */
export function decodeByBase64(txt: string) {
  return Base64.parse(txt).toString(Utf8)
}

/**
 * MD5加密
 * @param txt 待加密文本
 * @returns 加密后的文本
 */
export function encryptByMd5(txt: string) {
  return md5(txt).toString()
}

/**
 * RSA公钥
 */
const publicKey =
  'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAM51dgYtMyF+tTQt80sfFOpSV27a7t9u' +
  'aUVeFrdGiVxscuizE7H8SMntYqfn9lp8a5GH5P1/GGehVjUD2gF/4kcCAwEAAQ=='

/**
 * RSA加密
 * @param txt 待加密文本
 * @returns 加密后的文本
 */
export function encryptByRsa(txt: string) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

/**
 * 默认AES密钥
 */
const defaultKeyWord = 'XwKsGlMcdPMEhR1B'

/**
 * AES加密
 * @param word 待加密文本
 * @param keyWord 密钥
 * @returns 加密后的文本
 */
export function encryptByAes(word: string, keyWord: string = defaultKeyWord) {
  const key = CryptoJS.enc.Utf8.parse(keyWord)
  const src = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(src, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

/**
 * 登录密码加密
 * 使用RSA加密，如果RSA加密失败则使用AES加密
 * @param password 原始密码
 * @returns 加密后的密码
 */
export function encryptLoginPassword(password: string): string {
  try {
    // 优先使用RSA加密
    const rsaEncrypted = encryptByRsa(password)
    if (rsaEncrypted) {
      return rsaEncrypted as string
    }
  } catch (error) {
    console.warn('[Encrypt] RSA encryption failed, fallback to AES:', error)
  }

  // RSA加密失败时使用AES加密
  return encryptByAes(password)
}
