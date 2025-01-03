// tips: 请先调用
import './config';
import { config } from '@/utils/config';
import { createLogger } from '@/utils/logger';
/**
 * @public
 * @description 日志管理器
 */
export const logger = createLogger({ log4jsCfg: config().log4jsCfg });
