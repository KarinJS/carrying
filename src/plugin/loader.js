import lodash from 'lodash';
import path from 'node:path';
import util from 'node:util';
import schedule from 'node-schedule';
import { errorHandler } from '@/core/internal/error';
import { getPlugins } from './list';
import { cache } from './cache';
import { isClass } from '@/utils/system/class';
import { createLogger } from './tools';
import { isTsx } from '@/env';
import { createPluginDir } from '@/utils/fs/file';
let seq = 0;
/**
 * 插件加载
 * @description 插件加载
 * @class LoaderPlugin
 */
export class LoaderPlugin {
    /**
     * @description 初始化插件
     */
    async init() {
        logger.info(logger.green('-----------'));
        logger.info('加载插件中...');
        const list = await getPlugins('all', true);
        for (const pkg of list) {
            pkg.id = ++seq;
            cache.index[pkg.id] = pkg;
            /** 创建插件基本文件夹 */
            await createPluginDir(pkg.name, pkg.pkgData.karin?.files);
            for (const app of pkg.apps) {
                const result = await this.importApp(pkg.name, app);
                this.cachePlugin(result, pkg, app);
            }
            /** ts入口 */
            if (isTsx() && pkg.pkgData.karin?.main) {
                const file = path.join(pkg.dir, pkg.pkgData.karin.main);
                this.loaderMain(pkg.name, file);
            }
            /** js入口 */
            if (pkg.pkgData.main) {
                const file = path.join(pkg.dir, pkg.pkgData.main);
                this.loaderMain(pkg.name, file);
            }
            /** 静态资源目录 */
            if (pkg.pkgData?.karin?.static) {
                const list = Array.isArray(pkg.pkgData.karin.static) ? pkg.pkgData.karin.static : [pkg.pkgData.karin.static];
                cache.static.push(...list.map(file => path.resolve(pkg.dir, file)));
            }
        }
        this.sort();
        errorHandler.printMissing();
        logger.info('插件加载完成');
        logger.info(logger.green('-----------'));
    }
    /**
     * @description 热更新收集
     */
    /**
     * 处理导入的模块
     * @param app app文件绝对路径
     * @param type 插件类型
     * @param method 插件方法名称
     */
    createFile(app, type, method, name) {
        return {
            absPath: app,
            get dirname() {
                return path.dirname(this.absPath);
            },
            get basename() {
                return path.basename(this.absPath);
            },
            type,
            method,
            name: name || type,
        };
    }
    /**
     * 导入插件
     * @param name 插件包名称 `karin-plugin-example`
     * @param app 插件文件绝对路径 `/root/karin/plugins/karin-plugin-example/index.js`
     * @param isRefresh 是否加载新模块
     */
    async importApp(name, app, isRefresh = false) {
        try {
            const result = await import(`file://${app}${isRefresh ? `?t=${Date.now()}` : ''}`);
            return result;
        }
        catch (error) {
            errorHandler.loaderPlugin(name, app, error);
            return {};
        }
    }
    /**
     * 加载入口文件
     * @param name 插件名称
     * @param file 入口文件
     * @param isRefresh 是否刷新
     */
    async loaderMain(name, file, isRefresh = false) {
        try {
            await import(`file://${file}${isRefresh ? `?t=${Date.now()}` : ''}`);
        }
        catch (error) {
            errorHandler.loaderPlugin(name, file, error);
        }
    }
    /**
     * 判断是否为指定类型
     * @param val 插件方法
     * @param type 插件类型
     */
    isType(val, type) {
        return val.file?.type === type;
    }
    /**
     * 缓存插件
     * @param result 插件导入结果
     * @param info 插件信息
     */
    cachePlugin(result, pkg, app) {
        for (const key of Object.keys(result)) {
            /** 跳过默认导出 */
            if (key === 'default')
                continue;
            if (typeof result[key] === 'function') {
                if (!isClass(result[key]))
                    return;
                // TODO: 可以使用 instanceof 判断是否为插件类
                // if (result[key].prototype instanceof Plugin) {
                // }
                this.cacheClassPlugin(result[key], pkg, app, key);
                return;
            }
            const data = result[key];
            for (const val of (Array.isArray(data) ? data : [data])) {
                if (typeof val !== 'object')
                    continue;
                if (!val?.pkg || !val.file)
                    continue;
                val.pkg = pkg;
                val.file = this.createFile(app, val.file.type, key, val.file.name);
                if (this.isType(val, 'accept')) {
                    cache.count.accept++;
                    cache.accept.push(val);
                    continue;
                }
                if (this.isType(val, 'command')) {
                    cache.count.command++;
                    cache.command.push(val);
                    continue;
                }
                if (this.isType(val, 'button')) {
                    cache.count.button++;
                    cache.button.push(val);
                    continue;
                }
                if (this.isType(val, 'handler')) {
                    if (!cache.handler[val.key]) {
                        cache.count.handler.key++;
                        cache.handler[val.key] = [];
                    }
                    cache.count.handler.fnc++;
                    cache.handler[val.key].push(val);
                    continue;
                }
                if (this.isType(val, 'task')) {
                    val.schedule = schedule.scheduleJob(val.cron, async () => {
                        try {
                            val.log(`[定时任务][${val.name}][${val.cron}]: 开始执行`);
                            const result = val.fnc();
                            if (util.types.isPromise(result))
                                await result;
                            val.log(`[定时任务][${val.name}][${val.cron}]: 执行完成`);
                        }
                        catch (error) {
                            errorHandler.taskStart(val.name, val.name, error);
                        }
                    });
                    cache.count.task++;
                    continue;
                }
            }
        }
    }
    /**
     * 缓存类命令插件
     * @param result 插件导入结果
     * @param info 插件信息
     * @param pkg 插件包信息
     * @param app app文件绝对路径
     * @param key 插件方法名称
     */
    cacheClassPlugin(Method, pkg, app, key) {
        const command = new Method();
        if (!command.name) {
            logger.error(`[load][${app}] plugin.name 不能为空`);
            return;
        }
        if (!command.rule || !Array.isArray(command.rule) || command.rule?.length === 0) {
            logger.error(`[load][${app}] ${command.name} plugin.rule 不能为空`);
            return;
        }
        command.rule.forEach((v, i) => {
            /** 没有对应方法跳过 */
            if (!(v.fnc in command))
                return;
            /** 没有正则跳过 */
            if (typeof v.reg !== 'string' && !(v.reg instanceof RegExp))
                return;
            cache.command.push({
                pkg,
                type: 'class',
                log: createLogger(v.log, true),
                adapter: v.adapter || [],
                dsbAdapter: v.dsbAdapter || [],
                Cls: Method,
                reg: v.reg instanceof RegExp ? v.reg : new RegExp(v.reg),
                permission: v.permission || 'all',
                event: v.event || command.event || 'message',
                priority: v.priority || 10000,
                file: this.createFile(app, 'command', key, command.name),
                authFailMsg: v.authFailMsg,
            });
        });
    }
    /**
     * 排序
     */
    sort() {
        cache.accept = lodash.sortBy(cache.accept, ['rank'], ['asc']);
        cache.command = lodash.sortBy(cache.command, ['rank'], ['asc']);
        cache.task = lodash.sortBy(cache.task, ['rank'], ['asc']);
        cache.button = lodash.sortBy(cache.button, ['rank'], ['asc']);
        for (const key of Object.keys(cache.handler)) {
            cache.handler[key] = lodash.sortBy(cache.handler[key], ['rank'], ['asc']);
        }
    }
}
// /** 清理收集的缓存 */
// export const clearCache = () => {
//   load.main.length = 0
//   load.apps.length = 0
//   load.createDir.length = 0
// }
// /** 排序 */
// export const sort = () => {
//   cache.accept = lodash.sortBy(cache.accept, ['rank'], ['asc'])
//   cache.command = lodash.sortBy(cache.command, ['rank'], ['asc'])
//   cache.task = lodash.sortBy(cache.task, ['rank'], ['asc'])
//   cache.button = lodash.sortBy(cache.button, ['rank'], ['asc'])
//   cache.middleware.recvMsg = lodash.sortBy(cache.middleware.recvMsg, ['rank'], ['asc'])
//   cache.middleware.replyMsg = lodash.sortBy(cache.middleware.replyMsg, ['rank'], ['asc'])
//   cache.middleware.sendMsg = lodash.sortBy(cache.middleware.sendMsg, ['rank'], ['asc'])
//   cache.middleware.forwardMsg = lodash.sortBy(cache.middleware.forwardMsg, ['rank'], ['asc'])
//   cache.middleware.notFoundMsg = lodash.sortBy(cache.middleware.notFoundMsg, ['rank'], ['asc'])
//   for (const key of Object.keys(cache.handler)) {
//     cache.handler[key] = lodash.sortBy(cache.handler[key], ['rank'], ['asc'])
//   }
// }
// /**
//  * 卸载插件
//  * @param file 插件路径
//  * @param index 插件索引
//  */
// export const unloadApps = async (file: string, index: number) => {
//   cache.accept = cache.accept.filter(fnc => fnc.index !== index || fnc.file.path !== file)
//   cache.command = cache.command.filter(fnc => fnc.index !== index || fnc.file.path !== file)
//   cache.button = cache.button.filter(fnc => fnc.index !== index || fnc.file.path !== file)
//   cache.middleware.recvMsg = cache.middleware.recvMsg.filter(fnc => fnc.index !== index || fnc.file.path !== file)
//   cache.middleware.replyMsg = cache.middleware.replyMsg.filter(fnc => fnc.index !== index || fnc.file.path !== file)
//   cache.middleware.sendMsg = cache.middleware.sendMsg.filter(fnc => fnc.index !== index || fnc.file.path !== file)
//   cache.middleware.forwardMsg = cache.middleware.forwardMsg.filter(fnc => fnc.index !== index || fnc.file.path !== file)
//   cache.middleware.notFoundMsg = cache.middleware.notFoundMsg.filter(fnc => fnc.index !== index || fnc.file.path !== file)
//   cache.task = cache.task.filter(fnc => {
//     if (fnc.schedule) fnc.schedule.cancel()
//     return fnc.index !== index || fnc.file.path !== file
//   })
//   for (const key of Object.keys(cache.handler)) {
//     cache.handler[key] = cache.handler[key].filter(fnc => fnc.index !== index || fnc.file.path !== file)
//   }
//   sort()
// }
// /**
//  * 监听apps文件夹变动
//  * @param dir apps文件夹路径
//  * @param index 插件索引
//  * @param info 插件信息
//  */
// export const watchApps = async (dir: string, index: number, info: Info) => {
//   const isDev = process.env.karin_dev === 'dev'
//   if (info.type !== 'app' && !isDev) return
//   const ext = process.env.karin_lang === 'ts' ? ['.ts', '.js'] : ['.js']
//   logger.debug(`[hmr][${info.name}] 监听文件夹：${dir}`)
//   const watcher = chokidar.watch(dir, { ignoreInitial: true })
//   /**
//    * @description 处理文件变动
//    * @param file 文件路径
//    * @param action 文件操作
//    */
//   const handleFileChange = async (file: string, action: 'add' | 'change' | 'unlink') => {
//     file = path.resolve(file)
//     if (!ext.includes(path.extname(file))) return
//     if (action === 'unlink') {
//       await unloadApps(file, index)
//       logger.info(`[hmr][${info.name}][${path.basename(file)}] 卸载完成`)
//       return
//     }
//     if (action === 'change') {
//       await unloadApps(file, index)
//     }
//     const fnc = await importPlugin(file, index, info, true)
//     if (fnc) {
//       const list: Promise<void>[] = []
//       const { data, index, info, file } = fnc
//       if (typeof data !== 'object') return
//       for (const [key, val] of Object.entries(data)) {
//         list.push(loaderApp(index, info, file, key, val))
//       }
//       await Promise.allSettled(list)
//     }
//     const actionText = action === 'add' ? '加载' : '重载'
//     logger.info(`[hmr][${info.name}][${path.basename(file)}] ${actionText}完成`)
//   }
//   watcher.on('add', (file: string) => handleFileChange(file, 'add'))
//   watcher.on('change', (file: string) => handleFileChange(file, 'change'))
//   watcher.on('unlink', (file: string) => handleFileChange(file, 'unlink'))
//   sort()
// }
