import 'dotenv/config'
import '@/service/debug'
export * from '@/service/logger'
import '@/utils/config/init'
import '@/service/init'
export * from '@/service/index'
export * from '@/core/karin/index'
export * from '@/utils'
export * from '@/server'
export * from '@/adapter/onebot'
export * from '@/event/create'
export * from '@/adapter/index'
export * from '@/root'

export * from '@/types/adapter'
export * from '@/types/config'
export * from '@/types/event'
export * from '@/types/plugin'
export * from '@/types/segment'
export * from '@/types/system'
export { karin as default } from '@/core/karin/index'