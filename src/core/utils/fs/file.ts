import { mkdir } from './mkdir'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import axios, { AxiosError } from 'axios'
import fs from 'node:fs'
import path from 'node:path'
import type { AxiosRequestConfig } from 'axios'
import { basePath } from './root'

/** promisify stream.pipeline */
const streamPipeline = promisify(pipeline)
/** 当前运行环境的路径标准协议前缀 */
export const sep = path.sep === '/' ? /^file:\/\// : /^file:[/]{2,3}/

/**
 * 下载保存文件
 * @param  fileUrl 下载地址
 * @param  savePath 保存路径
 * @param param axios参数
 */
export const downFile = async (fileUrl: string, savePath: string, param: AxiosRequestConfig = {}) => {
  try {
    await mkdir(path.dirname(savePath))
    const response = await axios.get(fileUrl, { ...param, responseType: 'stream' })
    await streamPipeline(response.data, fs.createWriteStream(savePath))
    return true
  } catch (error) {
    if (error instanceof AxiosError) {
      logger.error(`下载文件错误：${error.stack}`)
    } else {
      logger.error(`下载文件错误：${error}`)
    }
    return false
  }
}

/**
 * 标准化文件路径 统一使用/分隔符
 * @param file - 路径
 * @param absPath - 返回绝对路径 默认为true
 * @param prefix - 添加file://前缀 默认为false
 * @returns 标准化后的路径
 */
export const absPath = (file: string, absPath = true, prefix = false) => {
  file = file.replace(/\\/g, '/')
  if (file.startsWith('file://')) file = file.replace(sep, '')

  file = path.normalize(file)
  if (absPath) file = path.resolve(file)
  if (prefix) file = 'file://' + file
  return file.replace(/\\/g, '/')
}

/**
 * 为每个插件创建基本文件夹结构
 * @param name 插件名称
 * @param files 需要创建的文件夹列表
 */
export const createPluginDir = async (name: string, files?: string[]) => {
  if (!Array.isArray(files)) files = ['config', 'data', 'resources']
  if (files.length === 0) return
  const pluginPath = path.join(basePath, name)
  if (!fs.existsSync(pluginPath)) await fs.promises.mkdir(pluginPath, { recursive: true })

  await Promise.all(files.map(file => {
    const filePath = path.join(pluginPath, file)
    if (!fs.existsSync(filePath)) return fs.promises.mkdir(filePath, { recursive: true })
    return Promise.resolve()
  }))
}
