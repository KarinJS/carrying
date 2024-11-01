import { YamlEditor } from '../fs/yaml'
import Axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { getAppPlugins, getNpmPlugins as GetNpmPlugins, getGitPlugins as GetGitPlugins } from '@plugin/index'

export { isDir, exists } from '../fs/exists'
export { downFile, absPath } from '../fs/file'
export { mkdirSync as mkdir } from '../fs/mkdir'
export { base64, buffer, stream } from '../fs/data'
export { getRelPath, urlToPath, splitPath } from '../fs/path'
export { read as readYaml, write as writeYaml } from '../fs/yaml'
export { readJsonSync as readJson, writeJsonSync as writeJson } from '../fs/json'
export { pkgRoot as pkgroot, getPluginInfo as pkgJson, isPlugin } from '../fs/pkg'
export { karinToQQBot as buttonToQQBot, karinToQQBot, qqbotToKarin } from '../button/convert'
export { createRawMessage, createRawMessage as makeMessageLog, makeMessage, makeForward } from '../message'

export type AxiosFn = {
  /**
   * 对axios进行简单封装，超时、错误后返回null，不会抛出异常
   * @param param axios参数
   */
  (param: AxiosRequestConfig): Promise<AxiosResponse<any> | null>
  /**
   * 对axios进行简单封装，超时、错误后返回null，不会抛出异常
   * @param url 请求地址
   * @param type 请求类型
   * @param param axios参数
   */
  (url: string, type: 'get' | 'post', param?: AxiosRequestConfig): Promise<AxiosResponse<any> | null>
}

export interface NpmInfo {
  plugin: string,
  path: string,
  file: string,
  isMain: boolean
}

/**
 * 休眠函数
 * @param ms 毫秒
 * @example
 * ```ts
 * await sleep(1000)
 * ```
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * axios请求
 * @param paramOrUrl axios参数或url
 * @param type 请求类型 只有在传入url时有效
 * @param param axios参数 只有在传入url时有效
 * @example
 * ```ts
 * await axios({ url: 'https://example.com', method: 'get' })
 * await axios({ url: 'https://example.com', method: 'post', data: { key: 'value' } })
 * await axios('https://example.com', 'post', { data: { key: 'value' } })
 * await axios('https://example.com', 'get')
 * // -> null 或 axios返回值
 * ```
 */
export const axios: AxiosFn = async (
  paramOrUrl: AxiosRequestConfig | string,
  type?: 'get' | 'post',
  param?: AxiosRequestConfig
): Promise<AxiosResponse<any> | null> => {
  try {
    const config = typeof paramOrUrl === 'string' ? { ...param, url: paramOrUrl, method: type } : paramOrUrl
    return await Axios(config)
  } catch (error) {
    error instanceof AxiosError ? logger.debug(error.stack) : logger.debug(error)
    return null
  }
}

/**
 * 获取运行时间
 * @example
 * ```ts
 * uptime()
 * // -> '1天2小时3分钟4秒'
 * // -> '2小时3分钟4秒'
 * // -> '3分钟4秒'
 * // -> '4秒'
 * ```
 */
export const uptime = () => {
  const time = process.uptime()
  const day = Math.floor(time / 86400)
  const hour = Math.floor((time % 86400) / 3600)
  const min = Math.floor((time % 3600) / 60)
  const sec = Math.floor(time % 60)

  const parts = [day ? `${day}天` : '', hour ? `${hour}小时` : '', min ? `${min}分钟` : '', !day && sec ? `${sec}秒` : '']

  return parts.filter(Boolean).join('')
}

/**
 * 传入一个时间戳
 * 返回距今已过去的时间
 * @param time - 时间戳
 *
 * @example
 * formatTime(1620000000)
 * // -> '18天'
 */
export const formatTime = (time: number): string => {
  if (typeof time !== 'number') throw TypeError('时间戳必须为数字')

  time = time.toString().length === 10 ? time * 1000 : time
  time = Math.floor((Date.now() - time) / 1000)

  const day = Math.floor(time / 86400)
  const hour = Math.floor((time % 86400) / 3600)
  const min = Math.floor((time % 3600) / 60)
  const sec = Math.floor(time % 60)

  return `${day}天${hour}小时${min}分钟${sec}秒`.replace(/0[天时分秒]/g, '')
}

/**
 * @deprecated 已废弃 建议使用`yaml`模块
 * 更新yaml文件
 * @param filePath - 文件路径
 * @param settings - 设置项
 */
export const updateYaml = (filePath: string, settings: Array<{
  /** 键路径 */
  key: string,
  /** 要写入的内容 */
  val: any,
  /** 需要写入的注释 */
  comment: string
  /** 注释在开头还是结尾 */
  type?: 'top' | 'end'
}>) => {
  let yaml = new YamlEditor(filePath)

  /** 先添加内容 */
  settings.forEach(({ key, val }) => {
    try {
      if (!yaml.has(key)) yaml.set(key, val)
    } catch (error: any) {
      logger.error(`[common] 更新yaml文件时出错：${error.stack || error.message || error}`)
    }
  })
  /** 先保存 */
  yaml.save()

  /** 重新解析 再次写入注释 直接写入注释会报错 写入的不是node节点模式 */
  yaml = new YamlEditor(filePath)
  settings.forEach(({ key, comment, type }) => {
    try {
      yaml.comment(key, comment, type === 'top')
    } catch (error: any) {
      logger.error(`[common] 更新yaml文件时出错：${error.stack || error.message || error}`)
    }
  })
  yaml.save()
}

/**
 * @deprecated 已废弃 请使用`getNpmPlugins`、`getNpmPluginsInfo`
 * 获取npm插件列表
 * @param showDetails - 是否返回详细信息
 * 默认只返回插件npm包名，为true时返回详细的{dir, name}[]
 */
export const getNpmPlugins = async (showDetails = false) => GetNpmPlugins()

/**
 * @deprecated 已废弃
 * 获取git插件列表
 * @param isPack - 是否屏蔽不带package.json的插件，默认为false
 */
export const getPlugins = async (isPack = false) => getGitPlugins()

/**
 * @deprecated 已废弃
 * 获取git插件列表
 * @param isPack - 是否屏蔽不带package.json的插件，默认为false
 */
export const getGitPlugins = async (isPack = false) => {
  const app = await getAppPlugins()
  const git = await GetGitPlugins()
  return app.concat(git)
}