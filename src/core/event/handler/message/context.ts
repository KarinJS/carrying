import type { Message } from '@/event/types'

/** 上下文缓存 */
export const context = new Map<string, Message>()