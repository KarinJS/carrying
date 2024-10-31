import type { Accept, CommandFnc, NoticeAndRequest, Task } from '@plugin/cache/types'
import type { ElementTypes } from '@/adapter/segment'
import type { MessageEventMap } from '@/event/types/types'
import { TypedListeners } from '@/internal/listeners'
import { cache, createLogger } from '@plugin/cache/cache'
import path from 'node:path'

export type FncElement = string | ElementTypes | ElementTypes[]
export type FncOptions = {
  /** 插件名称 */
  name?: string
  /** 是否启用日志 */
  log?: boolean
  /** 权限 默认`all` */
  perm?: CommandFnc['perm']
  /** 优先级 默认`10000` */
  rank?: CommandFnc['rank']
  /** 生效的适配器 */
  adapter?: CommandFnc['adapter']
  /** 禁用的适配器 */
  dsbAdapter?: CommandFnc['dsbAdapter']
  /**
   * 权限
   * @default 'all'
   * @deprecated 已废弃 请使用`perm`
   */
  permission?: CommandFnc['perm']
  /**
   * 插件优先级 数字越小优先级越高
   * @default 10000
   * @deprecated 已废弃 请使用`rank`
   */
  priority?: CommandFnc['rank']
  /**
   * 禁用的适配器
   * @deprecated 已废弃 请使用`dsbAdapter`
   */
  notAdapter?: CommandFnc['dsbAdapter']
}

export type FncElemOptions = FncOptions & {
  /** 是否加上at 仅在群聊中有效 */
  at?: boolean
  /** 是否加上引用回复 */
  reply?: boolean
  /** 延迟回复 单位毫秒 */
  delay?: number
  /** 发送是否撤回消息 单位秒 */
  recallMsg?: number
  /** 是否停止执行后续插件 */
  stop?: boolean
}

export interface TaskOptions {
  /** 插件名称 */
  name?: string
  /** 是否启用日志 */
  log?: boolean
}

type Fnc<T extends keyof MessageEventMap> = FncElement | ((e: MessageEventMap[T]) => Promise<boolean> | boolean)
type ElemAndEvent<T extends keyof MessageEventMap> = FncElemOptions & { event: T }
type Options<T extends keyof MessageEventMap> = (FncOptions & { event?: T }) | ElemAndEvent<T>

export class Karin extends TypedListeners {
  /**
  * @param reg 正则表达式
  * @param fnc 函数
  * @param options 选项
  */
  command<T extends keyof MessageEventMap = keyof MessageEventMap> (
    reg: string | RegExp,
    fnc: (e: MessageEventMap[T]) => Promise<boolean> | boolean,
    options?: FncOptions & {
      /** 监听事件 */
      event: T
    }): CommandFnc<T>
  /**
   * @param reg 正则表达式
   * @param element 字符串或者KarinElement、KarinElement数组
   * @param options 选项
   */
  command<T extends keyof MessageEventMap = keyof MessageEventMap> (reg: string | RegExp, element: FncElement, options: ElemAndEvent<T>): CommandFnc<T>
  /**
   * 快速构建命令
   * @param reg 正则表达式
   * @param second 函数或者字符串或者KarinElement、KarinElement数组
   * @param options 选项
   * @returns 返回插件对象
   */
  command<T extends keyof MessageEventMap = keyof MessageEventMap> (reg: string | RegExp, second: Fnc<T>, options: Options<T> = {}): CommandFnc<T> {
    reg = typeof reg === 'string' ? new RegExp(reg) : reg
    /** 参数归一化 */
    const fnc = typeof second === 'function'
      ? second
      : async (e: MessageEventMap[T]) => {
        const element = typeof second === 'number' ? String(second) : second
        await e.reply(element, {
          at: ('at' in options && options.at) || false,
          reply: ('reply' in options && options.reply) || false,
          recallMsg: ('recallMsg' in options && Number(options.recallMsg)) || 0,
        })
        return !('stop' in options && !options.stop)
      }

    const dsbAdapter = options.dsbAdapter || options.notAdapter || []

    return {
      index: 0,
      type: 'fnc',
      name: options.name || 'command',
      event: options.event || ('message' as T),
      fnc,
      log: createLogger(options.log),
      perm: options.perm || options.permission || 'all',
      rank: options.rank ?? options.priority ?? 10000,
      reg,
      adapter: Array.isArray(options.adapter) ? options.adapter : [],
      dsbAdapter: Array.isArray(dsbAdapter) ? dsbAdapter : [],
      file: {
        basename: '',
        dirname: '',
        method: '',
        type: 'command',
        get path () {
          return path.join(this.dirname, this.basename)
        },
      },
      get info () {
        return cache.index[this.index]
      },
    }
  }

  /**
   * accept
   * @param event 监听事件
   * @param fnc 实现函数
   */
  accept<T extends keyof NoticeAndRequest = keyof NoticeAndRequest> (event: T, fnc: (e: NoticeAndRequest[T]) => Promise<boolean> | boolean, options: Omit<FncOptions, 'perm' | 'permission'> = {}): Accept<T> {
    const dsbAdapter = options.dsbAdapter || options.notAdapter || []
    return {
      index: 0,
      event,
      fnc,
      log: createLogger(options.log),
      name: options?.name || '',
      rank: options.rank ?? options?.priority ?? 10000,
      adapter: Array.isArray(options.adapter) ? options.adapter : [],
      dsbAdapter: Array.isArray(dsbAdapter) ? dsbAdapter : [],
      file: {
        basename: '',
        dirname: '',
        method: '',
        type: 'accept',
        get path () {
          return path.join(this.dirname, this.basename)
        },
      },
      get info () {
        return cache.index[this.index]
      },
    }
  }

  /**
   * 构建定时任务
   * @param name 任务名称
   * @param cron cron表达式
   * @param fnc 执行函数
   * @param options 选项
   */
  task (name: string, cron: string, fnc: Function, options: TaskOptions = {}): Task {
    if (!name) throw new Error('[task]: 缺少参数[name]')
    if (!cron) throw new Error('[task]: 缺少参数[cron]')
    if (!fnc || typeof fnc !== 'function') throw new Error('[task]: 缺少参数或类型错误[fnc]')

    return {
      index: 0,
      name: options?.name || 'task',
      cron,
      fnc,
      log: createLogger(options.log, false),
      schedule: undefined,
      file: {
        basename: '',
        dirname: '',
        method: '',
        type: 'task',
        get path () {
          return path.join(this.dirname, this.basename)
        },
      },
      get info () {
        return cache.index[this.index]
      },
    }
  }
}

export const karin = new Karin()
