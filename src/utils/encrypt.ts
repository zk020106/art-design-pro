/**
 * 加密工具模块
 * 提供密码加密、Base64 编解码、MD5 等功能
 */

import CryptoJS from 'crypto-js'
import Base64 from 'crypto-js/enc-base64'
import UTF8 from 'crypto-js/enc-utf8'
import md5 from 'crypto-js/md5'
import { JSEncrypt } from 'jsencrypt'

/**
 * Base64 编码
 * @param txt 原始文本
 * @returns Base64 编码后的字符串
 */
export function encodeByBase64(txt: string) {
  return UTF8.parse(txt).toString(Base64)
}

/**
 * Base64 解码
 * @param txt Base64 编码的文本
 * @returns 解码后的字符串
 */
export function decodeByBase64(txt: string) {
  return Base64.parse(txt).toString(UTF8)
}

/**
 * MD5 加密
 * @param txt 原始文本
 * @returns MD5 加密后的字符串
 */
export function encryptByMd5(txt: string) {
  return md5(txt).toString()
}

/**
 * RSA 公钥
 * 用于密码加密传输
 */
const publicKey =
  'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAM51dgYtMyF+tTQt80sfFOpSV27a7t9u' +
  'aUVeFrdGiVxscuizE7H8SMntYqfn9lp8a5GH5P1/GGehVjUD2gF/4kcCAwEAAQ=='

/**
 * RSA 加密
 * 用于加密密码等敏感信息
 * @param txt 原始文本
 * @returns RSA 加密后的字符串,失败返回 false
 */
export function encryptByRsa(txt: string): string | false {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

/**
 * AES 默认密钥
 */
const defaultKeyWork = 'XwKsGlMcdPMEhR1B'

/**
 * AES 加密
 * @param word 原始文本
 * @param keyWord 密钥,默认使用 defaultKeyWork
 * @returns AES 加密后的字符串
 */
export function encryptByAes(word: string, keyWord: string = defaultKeyWork) {
  const key = CryptoJS.enc.Utf8.parse(keyWord)
  const arcs = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(arcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}
