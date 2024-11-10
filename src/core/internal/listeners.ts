import type { Event, Message } from '@/event'
import { EventEmitter } from 'events'
import { MessageEventMap, NoticeEventMap, RequestEventMap } from '@/event/types/types'

type MessageTypes<T extends keyof MessageEventMap> = Record<T, (event: MessageEventMap[T]) => void>
type NoticeTypes<T extends keyof NoticeEventMap> = Record<T, (event: NoticeEventMap[T]) => void>
type RequesTypes<T extends keyof RequestEventMap> = Record<T, (event: RequestEventMap[T]) => void>

type OtherTypes = {
  exit: (data: { type: string, code: unknown }) => void
  warn: (warning: unknown) => void
  error: (error: unknown) => void
  'karin:count:send': (count: number) => void
  'karin:count:fnc': (options: { name: string, file: object, event: Event }) => void
  'karin:adapter:open': () => void
  'karin:adapter:close': () => void
  'update:logger:level': () => void
  [key: `ctx:${string}`]: (e: Message) => void
}

/** 事件字典 */
export type EventMap =
  MessageTypes<keyof MessageEventMap>
  & NoticeTypes<keyof NoticeEventMap>
  & RequesTypes<keyof RequestEventMap>
  & OtherTypes

/** 类型化事件监听器 */
export class TypedListeners extends EventEmitter {
  /**
   * 注册事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  public on<T extends keyof EventMap> (event: T, listener: EventMap[T]): this {
    return super.on(event, listener)
  }

  /**
   * 注册一次性事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  public once<T extends keyof EventMap> (event: T, listener: EventMap[T]): this {
    return super.once(event, listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  public off<T extends keyof EventMap> (event: T, listener: EventMap[T]): this {
    return super.off(event, listener)
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 事件参数
   */
  public emit<T extends keyof EventMap> (event: T, ...args: Parameters<EventMap[T]>): boolean {
    return super.emit(event, ...args)
  }

  /**
   * 获取事件监听器列表
   * @param event 事件名称
   */
  public listeners<T extends keyof EventMap> (event: T): EventMap[T][] {
    return super.listeners(event) as EventMap[T][]
  }

  /**
   * 移除所有事件监听器
   * @param event 事件名称
   * @returns this
   */
  public removeAllListeners<T extends keyof EventMap> (event?: T): this {
    super.removeAllListeners(event)
    return this
  }

  /**
   * 设置最大监听器数量
   * @param n 最大监听器数量
   * @returns this
   */
  public setMaxListeners (n: number): this {
    super.setMaxListeners(n)
    return this
  }

  /**
   * 获取最大监听器数量
   * @returns 最大监听器数量
   */
  public getMaxListeners (): number {
    return super.getMaxListeners()
  }

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  public addListener<T extends keyof EventMap> (event: T, listener: EventMap[T]): this {
    return super.addListener(event, listener)
  }

  /**
   * 获取事件监听器数量
   * @param event 事件名称
   * @returns 监听器数量
   */
  public listenerCount<T extends keyof EventMap> (event: T): number {
    return super.listenerCount(event)
  }

  /**
   * 返回已注册的事件名称数组
   * @param event 事件名称
   * @returns 监听器数量
   */
  public eventNames<T extends keyof EventMap> (): T[] {
    return super.eventNames() as T[]
  }

  /**
   * 返回指定事件的原始监听器数组（包括一次性监听器）
   * @param event 事件名称
   * @returns 监听器数量
   */
  public rawListeners<T extends keyof EventMap> (event: T): Function[] {
    return super.rawListeners(event)
  }

  /**
   * 为指定事件添加监听器，但将其添加到监听器数组的开头
   * @param event 事件名称
   * @returns 监听器数量
   */
  public prependListener<T extends keyof EventMap> (event: T, listener: EventMap[T]): this {
    return super.prependListener(event, listener)
  }

  /**
   *  为指定事件添加一次性监听器，并将其添加到监听器数组的开头
   * @param event 事件名称
   * @returns 监听器数量
   */
  public prependOnceListener<T extends keyof EventMap> (event: T, listener: EventMap[T]): this {
    return super.prependOnceListener(event, listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  removeListener<T extends keyof EventMap> (event: T, listener: EventMap[T]): this {
    return super.removeListener(event, listener)
  }
}

/** 内部监听器实例 */
export const listeners = new TypedListeners()
