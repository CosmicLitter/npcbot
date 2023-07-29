import { localStorageStore } from "@skeletonlabs/skeleton";
import { writable, type Writable } from "svelte/store";
import type { ClientSettings, NpcChat } from "$lib/types";
import type { ChatCompletionRequestMessage } from "openai";

export const navStore: Writable<string[]> = localStorageStore("navStore", [])

export const settingsStore: Writable<ClientSettings> = localStorageStore('settingsStore', {})

export const isLoadingAnswerStore: Writable<boolean> = writable(false)

export const recentViewerStore: Writable<string[]> = writable([])


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