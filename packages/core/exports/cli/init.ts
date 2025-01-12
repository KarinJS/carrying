import fs from 'node:fs'
import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'

import { execSync } from './exec.js'

const dir = process.env.INIT_CWD || process.cwd()
const pkgDir = fileURLToPath(new URL('../..', import.meta.url))

/**
 * 创建基本目录
 */
export const createDir = () => {
  const list = [
    path.join(dir, 'logs'),
    path.join(dir, 'plugins', 'karin-plugin-example'),
    path.join(dir, '@karinjs', 'config'),
    path.join(dir, '@karinjs', 'data'),
    path.join(dir, '@karinjs', 'temp', 'console'),
    path.join(dir, '@karinjs', 'temp', 'html'),
    path.join(dir, '@karinjs', 'resource'),
  ]

  list.forEach((item) => {
    if (!fs.existsSync(item)) fs.mkdirSync(item, { recursive: true })
  })
}

/**
 * 创建 .pnpmfile.cjs 文件
 * @param dir - 目标目录
 */
const createPnpmFile = (dir: string) => {
  const pnpmfile = path.join(dir, '.pnpmfile.cjs')
  if (fs.existsSync(pnpmfile)) return

  const content = [
    '// 清空对等依赖中的node-karin',
    'function readPackage (pkg, context) {',
    '  if (pkg?.[\'peerDependencies\']?.[\'node-karin\'] && pkg[\'peerDependencies\'][\'node-karin\'] !== \'file:./lib\') {',
    '    delete pkg[\'peerDependencies\'][\'node-karin\']',
    '  }',
    '  return pkg',
    '}',
    'module.exports = {',
    '  hooks: {',
    '    readPackage',
    '  },',
    '}',
  ].join('\n')

  fs.writeFileSync(pnpmfile, content)
}

/**
 * 检查是否需要创建 .npmrc
 * @returns 如果不需要创建返回 true
 */
const shouldSkipNpmrc = () => {
  const { stdout } = execSync('npm config get registry')
  if (stdout.includes('registry.npmjs.org')) return true

  const { stdout: proxy } = execSync('npm config get proxy')
  return !!proxy
}

/**
 * 创建或更新 .npmrc 文件
 * @param dir - 目标目录
 */
const createOrUpdateNpmrc = (dir: string) => {
  // TODO: 后续改为远程api拉取 动态更新
  const list = [
    'node_sqlite3_binary_host_mirror=https://registry.npmmirror.com/-/binary/sqlite3',
    'better_sqlite3_binary_host_mirror=https://registry.npmmirror.com/-/binary/better-sqlite3',
    'sass_binary_site=https://registry.npmmirror.com/-/binary/node-sass',
    'sharp_binary_host=https://registry.npmmirror.com/-/binary/sharp',
    'sharp_libvips_binary_host=https://registry.npmmirror.com/-/binary/sharp-libvips',
    'canvas_binary_host_mirror=https://registry.npmmirror.com/-/binary/canvas',
    '# 19以下版本',
    'puppeteer_download_host=https://registry.npmmirror.com/mirrors',
    '# 20以上版本',
    'PUPPETEER_DOWNLOAD_BASE_URL = https://registry.npmmirror.com/binaries/chrome-for-testing',
  ]

  const npmrc = path.join(dir, '.npmrc')
  if (!fs.existsSync(npmrc)) {
    fs.writeFileSync(npmrc, list.join('\n'))
    return
  }

  const data = fs.readFileSync(npmrc, 'utf-8')
  const newEntries = list.filter(item => {
    const key = item.split('=')[0]
    return !data.includes(key)
  })

  if (newEntries.length > 0) {
    fs.appendFileSync(npmrc, '\n' + newEntries.join('\n'))
  }
}

/**
 * 创建或更新 .env 文件
 * @param dir - 目标目录
 */
const createOrUpdateEnv = (dir: string) => {
  const envData = [
    '# 是否启用HTTP',
    'HTTP_ENABLE=true',
    '# HTTP监听端口',
    'HTTP_PORT=7777',
    '# HTTP监听地址',
    'HTTP_HOST=0.0.0.0',
    '# HTTP鉴权秘钥 仅用于karin自身Api',
    'HTTP_AUTH_KEY=default',
    '# ws_server鉴权秘钥',
    'WS_SERVER_AUTH_KEY=',
    '\n',
    '# 是否启用Redis 关闭后将使用内部虚拟Redis',
    'REDIS_ENABLE=true',
    '# 重启是否调用pm2 如果不调用则会直接关机 此配置适合有进程守护的程序',
    'PM2_RESTART=true',
    '\n',
    '# 日志等级',
    'LOG_LEVEL=info',
    '# 日志保留天数',
    'LOG_DAYS_TO_KEEP=7',
    '# 日志文件最大大小 如果此项大于0则启用日志分割',
    'LOG_MAX_LOG_SIZE=0',
    '# logger.fnc颜色',
    'LOG_FNC_COLOR="#E1D919"',
    '\n',
    '# ffmpeg',
    'FFMPEG_PATH=',
    '# ffprobe',
    'FFPROBE_PATH=',
    '# ffplay',
    'FFPLAY_PATH=',
    '\n',
    '# 这里请勿修改',
    'RUNTIME=node',
  ]

  const env = path.join(dir, '.env')
  if (!fs.existsSync(env)) {
    fs.writeFileSync(env, envData.join('\n'))
    return
  }

  const value = fs.readFileSync(env, 'utf-8')
  const newEntries = envData.filter(item => {
    if (item.includes('#')) return false
    const key = item.split('=')[0]
    return !value.includes(key)
  })

  if (newEntries.length > 0) {
    fs.appendFileSync(env, '\n' + newEntries.join('\n'))
  }
}

/**
 * 创建或更新 .env.dev 文件
 * @param dir - 目标目录
 */
const createOrUpdateEnvDev = (dir: string) => {
  const envDevData = [
    '# 是否为开发环境',
    'NODE_ENV=development',
    '# 运行器',
    'RUNTIME=tsx',
  ]

  const envDev = path.join(dir, '.env.dev')
  if (!fs.existsSync(envDev)) {
    fs.writeFileSync(envDev, envDevData.join('\n'))
    return
  }

  const value = fs.readFileSync(envDev, 'utf-8')
  const newEntries = envDevData.filter(item => {
    if (item.includes('#')) return false
    const key = item.split('=')[0]
    return !value.includes(key)
  })

  if (newEntries.length > 0) {
    fs.appendFileSync(envDev, '\n' + newEntries.join('\n'))
  }
}

/**
 * 生成一些其他文件
 */
export const createOtherFile = async () => {
  createPnpmFile(dir)

  if (!shouldSkipNpmrc()) {
    createOrUpdateNpmrc(dir)
  }

  createOrUpdateEnv(dir)
  createOrUpdateEnvDev(dir)
}

/**
 * 生成配置文件
 */
export const createConfig = () => {
  const defCfg = path.join(pkgDir, 'default', 'config')
  /** 读取默认目录下的所有json文件 遍历复制到目标目录 */
  const files = fs.readdirSync(defCfg)
  files.forEach((file) => {
    /** 忽略非json文件 */
    if (!file.endsWith('.json')) return
    /** 默认配置文件路径 */
    const filePath = path.join(defCfg, file)
    /** 目标配置目录 */
    const targetPath = path.join(dir, '@karinjs', 'config')
    /** 目标配置文件路径 */
    const targetFile = path.join(targetPath, file)
    /** 如果目标配置文件不存在，则复制默认配置文件 */
    if (!fs.existsSync(targetFile)) {
      fs.copyFileSync(filePath, targetFile)
      return
    }

    /** 如果已存在 则合并一下配置 */
    const defData = fs.readFileSync(filePath, 'utf-8')
    const targetData = fs.readFileSync(targetFile, 'utf-8')
    const mergedData = { ...JSON.parse(defData), ...JSON.parse(targetData) }
    fs.writeFileSync(targetFile, JSON.stringify(mergedData, null, 2))
  })
}

/**
 * 修改package.json
 */
export const modifyPackageJson = () => {
  /** 将type设置为module */
  const pkg = fs.readFileSync(path.join(dir, 'package.json'), 'utf-8')
  const pkgData = JSON.parse(pkg)
  if (pkgData.type === 'module') return pkgData
  pkgData.type = 'module'
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkgData, null, 2))
  return pkgData
}

/**
 * 入口函数
 */
export const init = async () => {
  createDir()
  await createOtherFile()
  createConfig()
  modifyPackageJson()
  process.exit(0)
}