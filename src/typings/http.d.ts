declare namespace Http {
  /** 基础响应 */
  interface BaseResponse<T = unknown> {
    // 状态码
    code: string
    // 消息
    msg: string
    // 是否成功
    success: boolean
    // 时间戳
    timestamp: number
    // 数据
    data: T
  }
}
