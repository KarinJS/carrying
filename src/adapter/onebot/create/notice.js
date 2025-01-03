import { contactFriend, contactGroup, senderFriend, senderGroup } from '@/event';
import { createFriendIncreaseNotice, createGroupAdminChangedNotice, createGroupFileUploadedNotice, createGroupHlightsChangedNotice, createGroupHonorChangedNotice, createGroupLuckKingNotice, createGroupMemberAddNotice, createGroupMemberBanNotice, createGroupMemberDelNotice, createGroupMessageReactionNotice, createGroupPokeNotice, createGroupRecallNotice, createPrivatePokeNotice, createPrivateRecallNotice, } from '@/event/create';
/**
 * 创建通知事件
 * @param event onebot11通知事件
 * @param bot 标准api实例
 */
export const createNotice = (event, bot) => {
    const time = event.time;
    // 私聊撤回
    if (event.notice_type === "friend_recall" /* OB11NoticeType.FriendRecall */) {
        const userId = event.user_id + '';
        const messageId = event.message_id + '';
        const contact = contactFriend(userId);
        createPrivateRecallNotice({
            bot,
            eventId: `notice:${userId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderFriend(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                messageId,
                operatorId: userId,
                tips: '',
            },
        });
        return;
    }
    // 新增好友
    if (event.notice_type === "friend_add" /* OB11NoticeType.FriendAdd */) {
        const userId = event.user_id + '';
        const contact = contactFriend(userId);
        createFriendIncreaseNotice({
            bot,
            eventId: `notice:${userId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderFriend(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                targetId: userId,
            },
        });
        return;
    }
    // 群聊戳一戳
    if (event.notice_type === "notify" /* OB11NoticeType.Notify */ && event.sub_type === 'poke' && event.group_id) {
        const userId = event.user_id + '';
        const groupId = event.group_id + '';
        const contact = contactGroup(groupId);
        createGroupPokeNotice({
            bot,
            eventId: `notice:${groupId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderGroup(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                operatorId: userId,
                targetId: event.target_id + '',
                action: '',
                actionImage: '',
                suffix: '',
            },
        });
        return;
    }
    // 私聊戳一戳
    if (event.notice_type === "notify" /* OB11NoticeType.Notify */ && event.sub_type === 'poke') {
        const userId = event.user_id + '';
        const contact = contactFriend(userId);
        createPrivatePokeNotice({
            bot,
            eventId: `notice:${userId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderFriend(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                operatorId: userId,
                targetId: event.target_id + '',
                action: '',
                actionImage: '',
                suffix: '',
            },
        });
        return;
    }
    // 运气王事件
    if (event.notice_type === "notify" /* OB11NoticeType.Notify */ && event.sub_type === 'lucky_king') {
        const userId = event.user_id + '';
        const groupId = event.group_id + '';
        const contact = contactGroup(groupId);
        createGroupLuckKingNotice({
            bot,
            eventId: `notice:${groupId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderGroup(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                userId,
                targetId: event.target_id + '',
            },
        });
        return;
    }
    // 群聊荣誉变更
    if (event.notice_type === "notify" /* OB11NoticeType.Notify */ && event.sub_type === 'honor') {
        const userId = event.user_id + '';
        const groupId = event.group_id + '';
        const contact = contactGroup(groupId);
        createGroupHonorChangedNotice({
            bot,
            eventId: `notice:${groupId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderGroup(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                honorType: event.honor_type,
            },
        });
        return;
    }
    // 群消息撤回
    if (event.notice_type === "group_recall" /* OB11NoticeType.GroupRecall */) {
        const userId = event.user_id + '';
        const groupId = event.group_id + '';
        const messageId = event.message_id + '';
        const operatorId = event.operator_id + '';
        const contact = contactGroup(groupId);
        createGroupRecallNotice({
            bot,
            eventId: `notice:${groupId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderGroup(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                messageId,
                operatorId,
                targetId: userId,
                tip: '',
            },
        });
        return;
    }
    // 群成员增加
    if (event.notice_type === "group_increase" /* OB11NoticeType.GroupIncrease */) {
        const userId = event.user_id + '';
        const groupId = event.group_id + '';
        const contact = contactGroup(groupId);
        createGroupMemberAddNotice({
            bot,
            eventId: `notice:${groupId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderGroup(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                operatorId: event.operator_id + '',
                targetId: userId,
                type: event.sub_type,
            },
        });
        return;
    }
    // 群成员减少
    if (event.notice_type === "group_decrease" /* OB11NoticeType.GroupDecrease */) {
        const userId = event.user_id + '';
        const groupId = event.group_id + '';
        const contact = contactGroup(groupId);
        createGroupMemberDelNotice({
            bot,
            eventId: `notice:${groupId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderGroup(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                operatorId: event.operator_id + '',
                targetId: userId,
                type: event.sub_type === 'kick_me' ? 'kickBot' : event.sub_type,
            },
        });
        return;
    }
    // 群文件上传
    if (event.notice_type === "group_upload" /* OB11NoticeType.GroupUpload */) {
        const userId = event.user_id + '';
        const groupId = event.group_id + '';
        const contact = contactGroup(groupId);
        createGroupFileUploadedNotice({
            bot,
            eventId: `notice:${groupId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderGroup(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                fid: event.file.id,
                name: event.file.name,
                size: event.file.size,
                subId: event.file.busid,
            },
        });
        return;
    }
    // 群管理员变动
    if (event.notice_type === "group_admin" /* OB11NoticeType.GroupAdmin */) {
        const userId = event.user_id + '';
        const groupId = event.group_id + '';
        const contact = contactGroup(groupId);
        createGroupAdminChangedNotice({
            bot,
            eventId: `notice:${groupId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderGroup(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                targetId: userId,
                isAdmin: event.sub_type === 'set',
            },
        });
        return;
    }
    // 群禁言
    if (event.notice_type === "group_ban" /* OB11NoticeType.GroupBan */) {
        const userId = event.user_id + '';
        const groupId = event.group_id + '';
        const contact = contactGroup(groupId);
        createGroupMemberBanNotice({
            bot,
            eventId: `notice:${groupId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderGroup(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                operatorId: event.operator_id + '',
                targetId: userId,
                duration: event.duration,
                isBan: event.sub_type === 'ban',
            },
        });
        return;
    }
    // 群表情回应
    if (event.notice_type === "group_msg_emoji_like" /* OB11NoticeType.GroupMsgEmojiLike */) {
        const userId = event.user_id + '';
        const groupId = event.group_id + '';
        const contact = contactGroup(groupId);
        createGroupMessageReactionNotice({
            bot,
            eventId: `notice:${groupId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderGroup(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                count: event.likes[0].count,
                faceId: event.likes[0].emoji_id,
                isSet: true,
                messageId: event.message_id + '',
            },
        });
        return;
    }
    // 群表情回应 Lagrange
    if (event.notice_type === "reaction" /* OB11NoticeType.GroupMsgEmojiLikeLagrange */) {
        const userId = event.operator_id + '';
        const groupId = event.group_id + '';
        const contact = contactGroup(groupId);
        createGroupMessageReactionNotice({
            bot,
            eventId: `notice:${groupId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderGroup(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                count: event.count,
                faceId: Number(event.code),
                isSet: event.sub_type === 'add',
                messageId: event.message_id + '',
            },
        });
        return;
    }
    // 群精华
    if (event.notice_type === "essence" /* OB11NoticeType.GroupEssence */) {
        const userId = event.sender_id + '';
        const groupId = event.group_id + '';
        const contact = contactGroup(groupId);
        createGroupHlightsChangedNotice({
            bot,
            eventId: `notice:${groupId}.${event.time}`,
            rawEvent: event,
            time,
            contact,
            sender: senderGroup(userId),
            srcReply: (elements) => bot.sendMsg(contact, elements),
            content: {
                isSet: event.sub_type === 'add',
                messageId: event.message_id + '',
                operatorId: event.operator_id + '',
                senderId: userId,
            },
        });
        return;
    }
    logger.warn(`[AdapterOneBot] 收到未知事件: ${JSON.stringify(event)}`);
};
/**
 * 创建请求事件
 * @param event onebot11请求事件
 * @param bot 标准api实例
 */
export const createRequest = (event, bot) => {
};
/**
 * 处理元事件
 * @param event 元事件
 * @param bot 标准api实例
 */
export const createMeta = (event, bot) => {
};
