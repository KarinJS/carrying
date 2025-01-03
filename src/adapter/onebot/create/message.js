import { AdapterConvertKarin } from '../core/convert';
import { createFriendMessage, createGroupMessage } from '@/event/create';
import { contactFriend, contactGroup, senderFriend, senderGroup } from '@/event';
/**
 * 创建消息事件
 * @param event onebot11消息事件
 * @param bot 标准api实例
 */
export const createMessage = (event, bot) => {
    const time = event.time;
    if (event.message_type === 'private') {
        const userId = event.sender.user_id + '';
        const contact = contactFriend(userId);
        const sender = senderFriend(userId, event.sender.nickname, event.sender.sex, event.sender.age);
        createFriendMessage({
            bot,
            time,
            contact,
            sender,
            rawEvent: event,
            messageId: event.message_id + '',
            messageSeq: event.message_id,
            eventId: `message:${event.message_id}`,
            elements: AdapterConvertKarin(event.message),
            srcReply: (elements) => bot.sendMsg(contact, elements),
        });
        return;
    }
    /** tips: go-cqhttp这里会多一个guild类型 一起判断得了... */
    if (event.message_type === 'group') {
        const groupId = event.group_id + '';
        const userId = event.sender.user_id + '';
        const { nickname, role, sex, age, card, area, level, title } = event.sender;
        const contact = contactGroup(groupId);
        const sender = senderGroup(userId, role, nickname, sex, age, card, area, level, title);
        createGroupMessage({
            bot,
            contact,
            elements: AdapterConvertKarin(event.message),
            eventId: `message:${event.message_id}`,
            messageId: event.message_id + '',
            messageSeq: event.message_id,
            rawEvent: event,
            sender,
            time,
            srcReply: (elements) => bot.sendMsg(contact, elements),
        });
        return;
    }
    logger.warn(`[AdapterOneBot] 收到未知事件: ${JSON.stringify(event)}`);
};
