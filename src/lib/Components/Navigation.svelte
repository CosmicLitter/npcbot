<script lang="ts">
    import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createNewNpcChat, showModalComponent } from '$lib/shared';
	import { navStore, npcChatStore } from '$lib/stores';
	import { Character, type CharacterTemplate } from '$lib/types';
	import { modalStore, type ModalSettings } from '@skeletonlabs/skeleton';

    export let slug: string

    // Initialize the navigation array from the navStore
    $: navigation = $navStore

    // Add a unique route to the navigation store and route to it
    // function addChat(): void {
    //     navStore.update((value) => [...value, generateID()])
    //     goto(`/${$navStore[$navStore.length - 1]}`)

    // }

    // Generate a unique id for the chat
    // function generateID(): string {
    //     return (Math.floor(Math.random() * 1000000000) + 100000).toString();
    // }

    // Remove a route from the navigation store and route back to the first chat if the current chat is removed
    async function removeChat(id: string) {
        const modal: ModalSettings = {
            type: 'confirm',
            title: 'Please confirm delete chat',
            body: `Remove chat: ${id} from storage?`,
            response: (result: boolean) => {
                if (result) {
                    navStore.update((value) => value.filter(url => url !== id))
                    npcChatStore.deleteNpcChat(id)
                    // if (slug === id) {
                    //     goto(`/${$navStore[0]}`)
                    // }
                    // if ($navStore.length === 0) {
                    //     goto('/chat')
                    // }
                }
            }
        }
        modalStore.trigger(modal)
    }
    
    // Clear the navigation store and go to the chat page
    async function clearChats() {
        if (navigation.length > 0) {
            const modal: ModalSettings = {
                type: 'confirm',
                title: 'Please confirm delete all chats',
                body: 'This will remove all chats from storage. This action cannot be undone.',
                response: (result: boolean) => {
                    if (result) {
                        navStore.set([])
                        $npcChatStore = {}
                        goto('/chat')
                    }
                }
            }
            modalStore.trigger(modal)
        }

    }

    // Reponse from ADD NPC modal will need to popoulate a template to pass to the createNewNpcChat function
    // let template: CharacterTemplate

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

    $: classesActive = (href: string) => (href === $page.url.pathname ? '!bg-surface-500' : '');

</script>

<div class="flex flex-col w-60 border border-surface-500 gap-1">
    <!-- <div class="grid grid-cols-2">
        Create a new chat and add it to the navigation
        <button class="btn variant-filled-primary rounded-sm" on:click={() => createNewNpcChat(template)}>Add Chat</button>
        <button class="btn variant-filled-error rounded-sm" on:click={clearChats}>Clear Chats</button>
    </div>


    list each chat in the navigation array
    {#each navigation as url}
        <div class="grid grid-cols-[1fr_auto]">
            <a href={`/${url}`} class="anchor">{url}</a>

            Delete the chat and remove it from the navigation array
            <button class="btn variant-filled-primary rounded-sm" on:click={() => { removeChat(url); }}>
                X
            </button>
        </div>
    {/each} -->

    <!-- <span>Chat Nav template:</span> -->

    <div class="grid grid-cols-2">
        <button class="btn variant-filled-surface rounded-sm" on:click={() => addNpc()}>Add NPC</button>
        <button class="btn variant-filled-primary rounded-sm">Delete All</button>
    </div>

    <div>
        <nav class="list-nav ">
            <ul>
                {#each Object.entries($npcChatStore) as npc}
                    <li class="w-full grid grid-cols-[1fr_auto] items-center">
                        <a href={`/${npc[0]}`} class="{classesActive(`/${npc[0]}`)} !rounded-none bg-surface-800">{npc[1].name}</a>
                        <button class="btn variant-filled-surface !rounded-l-none !rounded-r-sm" on:click={() => { removeChat(npc[0]); }}>
                            X
                        </button>
                    </li>
                {/each}
            </ul>
        </nav>
    </div>
</div>