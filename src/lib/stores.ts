import { localStorageStore } from "@skeletonlabs/skeleton";
import { writable, type Writable } from "svelte/store";
import type { ClientSettings, NpcChat, TwitchChat, Viewer, ViewerSettings } from "$lib/types";
import type { ChatCompletionRequestMessage } from "openai";

export const navStore: Writable<string[]> = localStorageStore("navStore", [])

export const settingsStore: Writable<ClientSettings> = localStorageStore('settingsStore', {})

export const isLoadingAnswerStore: Writable<boolean> = writable(false)

export const recentViewerStore: Writable<Viewer[]> = writable([])

export const twitchChatStore: Writable<TwitchChat[]> = writable([])

// Npc Chat Store Interface
export interface NpcChatStore extends Writable<{ [key:string]: NpcChat }> {
    updateNpcChat(slug: string, update: Partial<NpcChat>): void
    addMessageToNpcChat(slug: string, message: ChatCompletionRequestMessage): void
    clearNpcChat(slug: string): void
    deleteNpcChat(slug: string): void
}

const _npcChatStore: Writable<{ [key:string]: NpcChat }> = localStorageStore('npcChatStore', {})

const updateNpcChat = (slug: string, update: Partial<NpcChat>) => {
    _npcChatStore.update((store) => {
        return { ...store, [slug]: { ...store[slug], ...update } }
    })
}

const addMessageToNpcChat = (slug: string, message: ChatCompletionRequestMessage) => {
    _npcChatStore.update((store) => {
        if (!store[slug]) {
            console.log(typeof(slug))
            console.error(`No NPC chat found for slug: ${slug}`)
            return store
        }
        return { ...store, [slug]: { ...store[slug], messages: [...store[slug].messages, message] } }
    })
}

const clearNpcChat = (slug: string) => {
    _npcChatStore.update((store) => {
        return { ...store, [slug]: { ...store[slug], messages: [] } }
    })
}

const deleteNpcChat = (slug: string) => {
    npcChatStore.update((store) => {
        const npcChats = { ...store }
        delete npcChats[slug]
        return npcChats
    })
}

export const npcChatStore: NpcChatStore = {
    subscribe: _npcChatStore.subscribe,
    set: _npcChatStore.set,
    update: _npcChatStore.update,
    updateNpcChat,
    addMessageToNpcChat,
    clearNpcChat,
    deleteNpcChat
}

// Voice Whitelist Store Interface
export interface VoiceWhitelistStore extends Writable<{ [key:string]: ViewerSettings }> {
    updateVoiceWhitelist(slug: string, update: Partial<ViewerSettings>): void
    deleteVoiceWhitelist(slug: string): void
    toggleVoiceQuote(slug: string): void
    toggleVoiceMute(slug: string): void
}

const _voiceWhitelistStore: Writable<{ [key:string]: ViewerSettings }> = localStorageStore('voiceWhitelistStore', {})

const updateVoiceWhitelist = (slug: string, update: Partial<ViewerSettings>) => {
    _voiceWhitelistStore.update((store) => {
        return { ...store, [slug]: { ...store[slug], ...update } }
    })
}

const deleteVoiceWhitelist = (slug: string) => {
    _voiceWhitelistStore.update((store) => {
        const whitelist = { ...store }
        delete whitelist[slug]
        return whitelist
    })
}

const toggleVoiceQuote = (slug: string) => {
    _voiceWhitelistStore.update((store) => {
        return { ...store, [slug]: { ...store[slug], quote: !store[slug].quote } }
    })
}

const toggleVoiceMute = (slug: string) => {
    _voiceWhitelistStore.update((store) => {
        return { ...store, [slug]: { ...store[slug], mute: !store[slug].mute } }
    })
}

export const voiceWhitelistStore: VoiceWhitelistStore = {
    subscribe: _voiceWhitelistStore.subscribe,
    set: _voiceWhitelistStore.set,
    update: _voiceWhitelistStore.update,
    updateVoiceWhitelist,
    deleteVoiceWhitelist,
    toggleVoiceQuote,
    toggleVoiceMute
}