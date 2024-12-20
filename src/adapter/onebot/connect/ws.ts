import { config } from '@/utils'
import { AdapterOneBot } from '../core/base'
import { Action, Params, Request } from '../types'
import { AdapterCommunication } from '@/adapter/adapter'
import { OB11Event, type OB11AllEvent } from '../types/event'
import { registerBot, unregisterBot } from '@/service/bot'
import type { WebSocket } from 'ws'
import { buildError } from '../core/convert'

export abstract class WsAdapterOneBot11 extends AdapterOneBot {
  /** 请求id */
  seq: number
  /** WebSocket实例 */
  socket: WebSocket

  constructor (socket: WebSocket) {
    super()
    this.seq = 0
    this.socket = socket
  }

  /**
   * 初始化
   * @param selfId 机器人ID
   * @param url WebSocket地址
   * @param communication 通讯方式
   */
  async init (selfId: string, url: string, communication: `${AdapterCommunication}`) {
    this.account.uid = selfId
    this.account.uin = selfId
    this.account.selfId = selfId
    this.adapter.address = url
    try {
      this.adapter.communication = communication
      this.onEvent()
      await Promise.all([this.setBotInfo(), this.setAdapterInfo()])
      logger.bot('info', this.selfId, `[onebot11][${communication}] 连接成功: ${url}`)

      this.adapter.index = registerBot(communication, this)
    } catch (error) {
      this.socket.close()
      throw new Error(`[onebot11][${communication}] 连接失败: ${url}`)
    }
  }

  private onEvent () {
    this.socket.on('message', (rawData) => {
      const str = rawData.toString()
      const json = JSON.parse(str)
      const data = json as OB11AllEvent

      if (json.echo) {
        logger.bot('debug', this.selfId, `Api调用回应: ${str}`)
        return this.socket.emit(json.echo, json)
      } else {
        if (data.post_type === OB11Event.MetaEvent && data.meta_event_type === 'heartbeat') {
          logger.bot('trace', this.selfId, '心跳')
          return
        }

        logger.bot('debug', this.selfId, `收到上报事件: ${str}`)
      }

      this.eventHandlers(data, str)
    })

    this.socket.on('close', () => {
      logger.bot('info', this.selfId, `[onebot11][${this.adapter.communication}] 连接关闭: ${this.adapter.address}`)
      unregisterBot('index', this.adapter.index)
    })
  }

  /** 获取登录号信息 */
  private async setAdapterInfo () {
    const info = await this.sendApi(Action.getVersionInfo, {})
    this.adapter.name = info.app_name
    this.adapter.version = info.app_version
  }

  /** 设置登录号详细信息 */
  private async setBotInfo () {
    const info = await this.sendApi(Action.getLoginInfo, {})
    this.account.name = info.nickname
    this.account.selfId = info.user_id + ''
    this.account.avatar = `https://q1.qlogo.cn/g?b=qq&s=0&nk=${info.user_id}`
  }

  async sendApi<T extends keyof Params> (
    action: T | `${T}`,
    params: Params[T],
    time = 120
  ): Promise<Request[T]> {
    if (!time) time = config.timeout()
    const echo = ++this.seq + ''
    const request = JSON.stringify({ echo, action, params })
    logger.bot('debug', this.selfId, `发送Api请求 ${action}: ${request}`)

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(buildError(this.selfId, action, request, '请求超时'))
      }, time * 1000)

      this.socket.send(request)
      this.socket.once(echo, data => {
        /** 停止监听器 */
        clearTimeout(timeoutId)

        if (data.status === 'ok') {
          resolve(data.data)
        } else {
          reject(buildError(this.selfId, action, request, data))
        }
      })
    })
  }
}
