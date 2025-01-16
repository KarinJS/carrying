import path from 'node:path'
import express from 'express'
import { createServer } from 'node:http'
import { router } from './api/router'
import { listeners } from '@/core/internal'

import type { Express } from 'express'
import { authMiddleware } from './middleware'

/** express 服务 */
export const app: Express = express()
/** http 服务 */
export const server = createServer(app)

/** 中间件鉴权 */
app.use(authMiddleware)

// TODO: WEB
app.use('/web', express.static(path.join(process.cwd(), 'web')))
app.use('/web/*', express.static(path.join(process.cwd(), 'web')))

app.use('/api/v1', router)

/**
 * 监听端口
 * @param port 监听端口
 * @param host 监听地址
 */
export const listen = (port: number, host: string) => {
  server.listen(port, host, () => {
    logger.info(`[server] express 已启动 正在监听: http://${host}:${port}`)
  })

  listeners.once('online', () => {
    /** logger会记录到日志文件中 */
    console.log(`[server] http鉴权token: ${logger.green(process.env.HTTP_AUTH_KEY)}`)
    console.log(`[server] ws鉴权token: ${logger.green(process.env.WS_SERVER_AUTH_KEY)}`)
  })
}
