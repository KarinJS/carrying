import util from 'node:util';
import { lockProp } from '@/utils/system/lock';
import { segment } from '@/utils/message';
import { makeMessage, createRawMessage } from '@/utils/message';
/** 事件实现基类 */
export class BaseEvent {
    #selfId;
    #event;
    #subEvent;
    #eventId;
    #rawEvent;
    #time;
    #contact;
    #sender;
    #srcReply;
    #bot;
    /** 快速回复 */
    reply;
    /** 存储器 由开发者自行调用 */
    store;
    /** 日志函数字符串 */
    logFnc;
    /** 日志用户字符串 */
    logText;
    /** 是否为主人 */
    isMaster;
    /** 是否为Bot管理员 */
    isAdmin;
    constructor({ event, subEvent, eventId, rawEvent, time, contact, sender, srcReply, bot, }) {
        this.#selfId = bot.selfId;
        this.#event = event;
        this.#subEvent = subEvent;
        this.#eventId = eventId;
        this.#rawEvent = rawEvent;
        this.#time = time;
        this.#contact = contact;
        this.#sender = sender;
        this.#srcReply = srcReply;
        this.#bot = bot;
        this.store = new Map();
        this.logFnc = '';
        this.logText = '';
        this.isMaster = false;
        this.isAdmin = false;
        this.reply = async (elements, options) => {
            /** 参数归一化 */
            const message = makeMessage(elements);
            const at = options?.at ?? false;
            const reply = options?.reply ?? false;
            const recallMsg = options?.recallMsg ?? 0;
            // const retryCount = options?.retryCount ?? 0
            /** 加入at */
            if (at && !this.isPrivate) {
                message.unshift(segment.at(this.userId));
            }
            /** 加入引用回复 */
            if (reply && 'message_id' in this) {
                message.unshift(segment.reply(this.message_id));
            }
            // TODO: 重试机制 收到消息中间键
            // karin.emit(SEND_MSG, this.contact)
            let result = {
                messageId: '',
                time: 0,
                messageTime: 0,
                rawData: {},
                /** @deprecated 已废弃，请使用 messageId */
                message_id: '',
            };
            // /** 先调用中间件 */
            // if (await MiddlewareHandler(cache.middleware.replyMsg, this, message)) {
            //   return result
            // }
            /** 先发 提升速度 */
            const request = this.#srcReply(message);
            const { raw } = createRawMessage(message);
            if (this.isGroup) {
                this.selfId !== 'console' && logger.bot('info', this.selfId, `${logger.green(`Send Group ${this.contact.peer}: `)}${raw.replace(/\n/g, '\\n')}`);
            }
            else {
                this.selfId !== 'console' && logger.bot('info', this.selfId, `${logger.green(`Send private ${this.contact.peer}: `)}${raw.replace(/\n/g, '\\n')}`);
            }
            /** 发送消息 */
            result = util.types.isPromise(request) ? await request : request;
            result.message_id = result.messageId;
            /** 快速撤回 */
            if (recallMsg > 0 && result.messageId) {
                setTimeout(() => {
                    this.bot.recallMsg(this.contact, result.messageId);
                }, recallMsg * 1000);
            }
            return result;
        };
        lockProp(this, 'reply');
    }
    /**
     * @description 机器人ID
     * @deprecated 即将废弃，请使用 `selfId`
     */
    get self_id() {
        return this.#selfId;
    }
    /**
     * @description 用户ID
     * @deprecated 即将废弃，请使用 `userId`
     */
    get user_id() {
        return this.userId;
    }
    /** 机器人自身ID */
    get selfId() {
        return this.#selfId;
    }
    /** 用户ID */
    get userId() {
        return this.#sender.userId;
    }
    /** 事件父类型 */
    get event() {
        return this.#event;
    }
    /** 事件子类型 */
    get subEvent() {
        return this.#subEvent;
    }
    /** 事件ID */
    get eventId() {
        return this.#eventId;
    }
    /** 原始事件 */
    get rawEvent() {
        return this.#rawEvent;
    }
    /** 事件触发时间戳 */
    get time() {
        return this.#time;
    }
    /** 事件来源信息 */
    get contact() {
        return this.#contact;
    }
    /** 事件发送者信息 */
    get sender() {
        return this.#sender;
    }
    /** 快速回复源函数 */
    get srcReply() {
        return this.#srcReply;
    }
    /** 机器人实例 */
    get bot() {
        return this.#bot;
    }
    /**
     * 是否为私聊场景
     * - 在好友场景下为 `true`
     * - 在频道私信场景下为 `true`
     */
    get isPrivate() {
        return this.#contact.scene === 'friend';
    }
    /** 是否为好友场景 */
    get isFriend() {
        return this.isPrivate;
    }
    /** 是否为群聊场景 */
    get isGroup() {
        return this.#contact.scene === 'group';
    }
    /** 是否为频道场景 */
    get isGuild() {
        return this.#contact.scene === 'guild';
    }
    /** 是否为群临时会话场景 */
    get isGroupTemp() {
        return this.#contact.scene === 'groupTemp';
    }
    /** 是否为频道私信场景 */
    get isDirect() {
        return this.#contact.scene === 'direct';
    }
}
