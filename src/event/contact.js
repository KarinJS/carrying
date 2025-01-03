/**
 * 构建好友事件来源
 * @param peer 好友ID
 * @param name 好友昵称 默认为空字符串
 */
export const contactFriend = (peer, name = '') => {
    return {
        scene: 'friend',
        peer,
        name,
    };
};
/**
 * 构建群聊事件来源
 * @param peer 群ID
 * @param name 群名
 */
export const contactGroup = (peer, name = '') => {
    return {
        scene: 'group',
        peer,
        name,
    };
};
/**
 * 构建频道私信事件来源
 * @param peer 频道ID
 * @param subId 子频道ID
 * @param srcGuildId 来源频道ID
 * @param name 频道名称 默认为空字符串
 * @param subName 子频道名称 默认为空字符串
 */
export const contactDirect = (peer, subId, srcGuildId, name = '', subName = '') => {
    return {
        scene: 'direct',
        peer,
        subPeer: subId,
        name,
        srcGuildId,
        subName,
    };
};
/**
 * 构建频道事件来源
 * @param peer 频道ID
 * @param subPeer 子频道ID
 * @param name 频道名称 默认为空字符串
 * @param subName 子频道名称 默认为空字符串
 */
export const contactGuild = (peer, subPeer, name = '', subName = '') => {
    return {
        scene: 'guild',
        peer,
        subPeer,
        name,
        subName,
    };
};
/**
 * 构建群聊临时会话事件来源
 * @param peer 群ID
 * @param subPeer 发起临时会话的用户ID
 * @param name 群名
 */
export const contactGroupTemp = (peer, subPeer, name = '') => {
    return {
        scene: 'groupTemp',
        peer,
        subPeer,
        name,
    };
};
/**
 * 事件来源构建器
 * @description 用于构建不同场景的事件来源信息
 */
export const contact = {
    /** 好友场景 */
    friend: contactFriend,
    /** 群聊场景 */
    group: contactGroup,
    /** 频道场景 */
    guild: contactGuild,
    /** 频道私信场景 */
    direct: contactDirect,
    /** 群聊临时会话场景 */
    groupTemp: contactGroupTemp,
};
