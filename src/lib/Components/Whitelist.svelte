<script lang="ts">
	import { addViewer } from "$lib/shared";
    import { recentViewerStore, settingsStore, voiceWhitelistStore } from "$lib/stores";
	import type { ViewerSettings } from "$lib/types";
	import { RangeSlider, SlideToggle, Tab, TabGroup, type ModalSettings, modalStore } from "@skeletonlabs/skeleton";
    
    let tabSet: number = 0

    async function modalConfirmDelete(user: [string, ViewerSettings] | string[]) {

        const modal: ModalSettings = {
            type: 'confirm',
            title: 'Remove Viewer',
            body: `remove ${user[0]} from whitelist?`,
            response: (result: boolean) => {
                if (result) {
                    voiceWhitelistStore.deleteVoiceWhitelist(user[0])
                }
            }
        }
        modalStore.trigger(modal)
    }
</script>
<TabGroup justify="justify-center">
    <Tab rounded="rounded-sm" bind:group={tabSet} name="tab1" value={0}>Active</Tab>
    <Tab rounded="rounded-sm" bind:group={tabSet} name="tab2" value={1}>Whitelist</Tab>
    <svelte:fragment slot="panel">
        {#if tabSet === 0}
            <!-- Active chatters -->
            <div class="overflow-y-auto hide-scrollbar px-1 h-[650px]">
                {#each $recentViewerStore as viewer}
                    <div class="input-group input-group-divider my-1 rounded-sm grid grid-cols-[1fr_auto]">
                        <span class="flex items-center text-slate-300">{viewer.username}</span>
                        <button class="btn btn-sm rounded-sm input-group-shim" on:click={() => addViewer(viewer.username)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#84cc16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </button>
                    </div>
                {/each}
            </div>
        {:else if tabSet === 1}
            <!-- Voice Whitelist -->
            <div class="overflow-y-auto hide-scrollbar h-[650px] flex flex-col gap-4">
                {#each Object.entries($voiceWhitelistStore) as user}
                    <div class="border variant-soft-surface border-surface-500">
                        <p class="text-lg text-center text-slate-300 px-2">
                            <b>{user[0]}</b>
                        </p>
                        <div class="input-group input-group-divider drop-shadow-md rounded-none grid-cols-[1fr_auto_auto_auto]">
                            <!-- Select Voice -->
                            <select 
                                class="select rounded-sm"
                                
                                bind:value={$voiceWhitelistStore[user[0]].voiceSettings.voice}>
                                    {#each $settingsStore.voiceLibrary ?? [] as voice}
                                        <option value={voice.id}>{voice.name}</option>
                                    {/each}
                            </select>
                            <!-- Quote -->
                            <button class="input-group-shim rounded-sm btn btn-small !p-3" on:click={() => voiceWhitelistStore.toggleVoiceQuote(user[0])}>
                                {#if user[1].quote}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-quote"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                                {:else}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-quote"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                                {/if}
                            </button>
                            <!-- Mute -->
                            <button class="input-group-shim rounded-sm btn btn-small !p-3" on:click={() => voiceWhitelistStore.toggleVoiceMute(user[0])}>
                                {#if user[1].mute}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-x"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>
                                {:else}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                                {/if}
                            </button>
                            <!-- Delete -->
                            <button class="input-group-shim rounded-sm btn btn-small !p-3" on:click={() => modalConfirmDelete(user)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"/></svg>
                            </button>
                        </div>
                        <!-- Voice stability and similarity sliders -->
                        <div class="grid grid-cols-[auto_auto]">
                            <RangeSlider
                                name="stability"
                                min={0}
                                max={1}
                                step={0.01}
                                bind:value={$voiceWhitelistStore[user[0]].voiceSettings.stability}
                            />
                            <RangeSlider
                                name="similarity"
                                min={0}
                                max={1}
                                step={0.01}
                                bind:value={$voiceWhitelistStore[user[0]].voiceSettings.similarity}
                            />
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </svelte:fragment>
</TabGroup>
