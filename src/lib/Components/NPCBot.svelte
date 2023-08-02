<script lang="ts">
	import { page } from "$app/stores";
	import { createNewNpcChat, showModalComponent } from "$lib/shared";
	import { npcChatStore } from "$lib/stores";
	import { Character, type CharacterTemplate, type NpcChat } from "$lib/types";
	import { modalStore, type ModalSettings } from "@skeletonlabs/skeleton";
	import type { ChatCompletionRequestMessage } from "openai";

    // export let slug: string | undefined

    // let selectedNPC: NpcChat[]
    // let chat: ChatCompletionRequestMessage[] 

    // $: {
    //     // console.log(selectedNPC)
    //     console.log(slug)
    //     if (selectedNPC) {
    //         chat = selectedNPC[1].messages
    //         console.log(chat)
    //     }
    // }

    $: classesActive = (href: string) => (href === $page.url.pathname ? '!bg-secondary-500' : '');

    const addNpc = (character: Character = new Character) => {
        new Promise<any>((resolve) => {
            showModalComponent('NPCSettings', { character }, resolve)
        }).then((r: any) => {
            console.log('resolved', r)
            const template: CharacterTemplate = {
                name: r.name,
                systemPrompt: r.systemPrompt,
                voice: r.voiceSettings
            }
            createNewNpcChat(template)
        })
    }

    async function removeChat(id: string) {
        const modal: ModalSettings = {
            type: 'confirm',
            title: 'Please confirm delete chat',
            body: `Are you sure you want to delete ${$npcChatStore[id].name}?`,
            response: (result: boolean) => {
                if (result) {
                    npcChatStore.deleteNpcChat(id)
                }
            }
        }
        modalStore.trigger(modal)
    }

    function clearChats() {
        const modal: ModalSettings = {
            type: 'confirm',
            title: 'Please confirm delete all chats',
            body: 'This will remove all NPC chats. This action cannot be undone.',
            response: (result: boolean) => {
                if (result) {
                    $npcChatStore = {}
                }
            }
        }
        modalStore.trigger(modal) 
    }

</script>


<div class="flex flex-col drop-shadow-lg border border-surface-500">
    <div class="grid grid-cols-2">
        <button class="btn variant-filled-surface rounded-none" on:click={() => addNpc()}>Add NPC</button>
        <button class="btn variant-filled-primary rounded-none" on:click={clearChats}>Delete All</button>
    </div>

    <div>
        <nav class="list-nav">
            <ul>
                {#each Object.entries($npcChatStore) as npc}
                    <li class="w-full grid grid-cols-[1fr_auto_auto] items-center">
                        <a href={`/${npc[0]}`} class="{classesActive(`/${npc[0]}`)} !rounded-none bg-surface-800">
                            {npc[1].name}
                        </a>
                        <button class="btn btn-small variant-filled-surface !rounded-none !p-3" on:click={() => {npcChatStore.clearNpcChat(npc[0])}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eraser"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
                        </button>
                        <button class="btn btn-small variant-filled-surface !rounded-none !p-3" on:click={() => {removeChat(npc[0])}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                    </li>
                {/each}
            </ul>
        </nav>
    </div>
</div>
    
