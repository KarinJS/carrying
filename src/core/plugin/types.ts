/** 插件信息收集类型 */
export interface PluginInfo {
  /** 入口文件绝对路径 */
  main: string
  /** app列表<app绝对路径> */
  apps: string[]
  /** 插件目录绝对路径 */
  path: string
  /** 插件包名 */
  name: string
  /** 插件版本 */
  version: string
  /** 解析后的package.json */
  pkg: Record<string, any> & {
    karin?: {
      /** 插件app列表 */
      apps?: string | string[]
      /** 静态资源目录 */
      static?: string | string[]
      /** 基本文件夹结构 */
      files?: string[]
    }
  }
}
