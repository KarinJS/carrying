import fs from 'node:fs'
import path from 'node:path'
import { getPlgsCache } from '../cache/cache'
import { type PluginInfo } from './types'
import { type GitPluginName } from './git'

const key = {
  list: 'app:list',
  info: 'app:list:info',
}

/**
 * @description 获取单个app列表
 * @example
 * ```ts
 * console.log(await getAppList('karin-plugin-xxx'))
 * // -> ['karin-plugin-test', 'karin-plugin-xxx']
 * ```
 */
export const getAppPlugins = async (): Promise<GitPluginName[]> => {
  const cached = getPlgsCache.get(key.list)
  if (cached) return cached

  const dir = './plugins'
  const files = await fs.promises.readdir(dir, { withFileTypes: true })
  /** 忽略文件、非`karin-plugin-`开头的文件夹、忽略存在`package.json` */
  const list = await Promise.all(files.map(async v => {
    if (!v.isDirectory()) return ''
    if (!v.name.startsWith('karin-plugin-')) return ''
    if (fs.existsSync(`${dir + v.name}/package.json`)) return ''
    return v.name
  })) || []

  const ext = process.env.karin_app_lang === 'ts' ? ['.ts', '.js'] : ['.js']
  /** 如果对应的文件夹没有包含一个这些后缀文件 则去除该文件夹 */
  await Promise.all(list.map(async name => {
    if (!name) return
    const files = fs.readdirSync(path.join(dir, name), { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) continue
      if (ext.includes(path.extname(file.name))) return true
    }
    return false
  }))

  /** 1分钟后删除缓存 */
  getPlgsCache.set(key.list, list)
  setTimeout(() => getPlgsCache.delete(key.list), 60 * 1000)
  return list as GitPluginName[]
}

/**
 * 获取单个app插件列表详细信息
 * @description 获取git插件列表详细信息
 * @example
 * ```ts
 * console.log(await getAppPluginsInfo())
 * // -> [{
 * //   type: 'app',
 * //   apps: ['plugins/karin-plugin-test/index.js'],
 * //   main: '',
 * //   path: 'plugins/karin-plugin-test',
 * //   name: 'karin-plugin-test',
 * //   pkg: { name: 'karin-plugin-test', version: '0.0.0' },
 * //   version: '0.0.0'
 * // }]
 * ```
 */
export const getAppPluginsInfo = async (): Promise<PluginInfo[]> => {
  const cached = getPlgsCache.get(key.info)
  if (cached) return cached

  /** 插件列表 */
  const list = await getAppPlugins()
  /** 插件信息 */
  const info: PluginInfo[] = []

  await Promise.all(list.map(async (name) => {
    const filePath = `./plugins/${name}`
    const plugin: PluginInfo = {
      type: 'app',
      apps: [],
      main: '',
      path: filePath,
      name,
      pkg: { name },
      version: '0.0.0',
    }

    const ext = process.env.karin_app_lang === 'ts' ? ['.ts', '.js'] : ['.js']
    const files = fs.readdirSync(filePath, { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) continue
      if (ext.includes(path.extname(file.name))) {
        plugin.apps.push(`${filePath}/${file.name}`)
      }
    }
  }))

  /** 1分钟后删除缓存 */
  getPlgsCache.set(key.info, info)
  setTimeout(() => getPlgsCache.delete(key.info), 60 * 1000)
  return info
}