import * as fnc from './export';
export declare const karin: typeof fnc & {
    name: "karin";
    contact(scene: "friend", peer: string, name?: string): import("../../types/event").Contact<"friend">;
    contact(scene: "group", peer: string, name?: string): import("../../types/event").Contact<"group">;
    contact(scene: "guild", peer: string, subPeer: string, name?: string): import("../../types/event").Contact<"guild">;
    contact(scene: "direct", peer: string, subPeer: string, name?: string): import("../../types/event").Contact<"direct">;
    contact(scene: "groupTemp", peer: string, subPeer: string, name?: string): import("../../types/event").Contact<"groupTemp">;
    contactGroup(peer: import("../../types/event").Contact["peer"], name?: string): import("../../types/event").Contact<"group">;
    contactFriend(peer: import("../../types/event").Contact["peer"], name?: string): import("../../types/event").Contact<"friend">;
    contactGuild(peer: string, subPeer: string, name?: string, subName?: string): import("../../types/event").Contact<"guild">;
    contactGroupTemp(peer: string, subPeer: string, name?: string): import("../../types/event").Contact<"groupTemp">;
    friendSender(userId: number | string, nick: string, sex?: import("../../types/event").FriendSender["sex"], age?: number, uid?: string, uin?: number): import("../../types/event").FriendSender;
    groupSender(userId: number | string, role: import("../../types/event").GroupSender["role"], nick?: string, sex?: import("../../types/event").GroupSender["sex"], age?: number, card?: string, area?: string, level?: number, title?: string, uid?: string, uin?: number): import("../../types/event").GroupSender;
    getBotByIndex(index: number): import("../../types/adapter").AdapterType | null;
    getBotCount(): number;
    getBotAll<T extends boolean = false>(isIndex?: T): T extends true ? ReturnType<typeof import("../service").getAllBotList> : ReturnType<typeof import("../service").getAllBot>;
    [EventEmitter.captureRejectionSymbol]?<K>(error: Error, event: string | symbol, ...args: any[]): void;
    addListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    on<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    once<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    removeListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    off<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    removeAllListeners(eventName?: string | symbol | undefined): any;
    setMaxListeners(n: number): any;
    getMaxListeners(): number;
    listeners<K>(eventName: string | symbol): Function[];
    rawListeners<K>(eventName: string | symbol): Function[];
    emit<K>(eventName: string | symbol, ...args: any[]): boolean;
    listenerCount<K>(eventName: string | symbol, listener?: Function | undefined): number;
    prependListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    prependOnceListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    eventNames(): (string | symbol)[];
};
/**
 * @deprecated 已废弃，请使用`karin`
 */
export declare const Bot: typeof fnc & {
    name: "karin";
    contact(scene: "friend", peer: string, name?: string): import("../../types/event").Contact<"friend">;
    contact(scene: "group", peer: string, name?: string): import("../../types/event").Contact<"group">;
    contact(scene: "guild", peer: string, subPeer: string, name?: string): import("../../types/event").Contact<"guild">;
    contact(scene: "direct", peer: string, subPeer: string, name?: string): import("../../types/event").Contact<"direct">;
    contact(scene: "groupTemp", peer: string, subPeer: string, name?: string): import("../../types/event").Contact<"groupTemp">;
    contactGroup(peer: import("../../types/event").Contact["peer"], name?: string): import("../../types/event").Contact<"group">;
    contactFriend(peer: import("../../types/event").Contact["peer"], name?: string): import("../../types/event").Contact<"friend">;
    contactGuild(peer: string, subPeer: string, name?: string, subName?: string): import("../../types/event").Contact<"guild">;
    contactGroupTemp(peer: string, subPeer: string, name?: string): import("../../types/event").Contact<"groupTemp">;
    friendSender(userId: number | string, nick: string, sex?: import("../../types/event").FriendSender["sex"], age?: number, uid?: string, uin?: number): import("../../types/event").FriendSender;
    groupSender(userId: number | string, role: import("../../types/event").GroupSender["role"], nick?: string, sex?: import("../../types/event").GroupSender["sex"], age?: number, card?: string, area?: string, level?: number, title?: string, uid?: string, uin?: number): import("../../types/event").GroupSender;
    getBotByIndex(index: number): import("../../types/adapter").AdapterType | null;
    getBotCount(): number;
    getBotAll<T extends boolean = false>(isIndex?: T): T extends true ? ReturnType<typeof import("../service").getAllBotList> : ReturnType<typeof import("../service").getAllBot>;
    [EventEmitter.captureRejectionSymbol]?<K>(error: Error, event: string | symbol, ...args: any[]): void;
    addListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    on<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    once<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    removeListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    off<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    removeAllListeners(eventName?: string | symbol | undefined): any;
    setMaxListeners(n: number): any;
    getMaxListeners(): number;
    listeners<K>(eventName: string | symbol): Function[];
    rawListeners<K>(eventName: string | symbol): Function[];
    emit<K>(eventName: string | symbol, ...args: any[]): boolean;
    listenerCount<K>(eventName: string | symbol, listener?: Function | undefined): number;
    prependListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    prependOnceListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): any;
    eventNames(): (string | symbol)[];
};
