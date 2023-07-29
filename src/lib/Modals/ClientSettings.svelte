<script lang="ts">
	import { settingsStore } from "$lib/stores";
    import { getVoices } from "$lib/shared";
	import { modalStore, toastStore, type ToastSettings } from "@skeletonlabs/skeleton";
    import type { Voice } from "$lib/types";

    // Mask the API key when not editing it
    function maskString(input: string, maxTotalLength = 20, visibleChars = 4) {
        if (!input || input.length < maxTotalLength) {
            return input;
        }

        const maskedLength = maxTotalLength - visibleChars;
        const visible = input.slice(-visibleChars);
        const masked = Array(maskedLength).fill('*').join('');

        return masked + visible;
    }

    function setElevenLabsApiKey() {
        if (!$settingsStore.elevenLabsApiKey) {
            console.log("No API key to set")
            return;
        }
        editEAPIKey = false;
    }

    function setOpenAIApiKey() {
        if (!$settingsStore.openAiApiKey) {
            console.log("No API key to set")
            return;
        }
        editOAPIKey = false;
    }

    async function fetchVoices() {
        if (!$settingsStore.elevenLabsApiKey) {
            console.log("Missing ElevenLabs API key")
            return;
        }

        try {
            voices = await getVoices($settingsStore.elevenLabsApiKey)
            const t: ToastSettings = {
                message: `Imported ${voices.length - 1} voices successfully!`,
                background: "variant-filled-success",
            }
            toastStore.trigger(t)
            modalStore.close()
        } catch (e) {
            console.error('Error retrieving voices. Either the API key is invalid or the Eleven Labs API is down.')
            console.error(e)
            const t: ToastSettings = {
                message: "Error retrieving voices. Either the API key is invalid or the Eleven Labs API is down.",
                background: "variant-filled-error",
            }
            toastStore.trigger(t)
        }
    }

    let editEAPIKey = false
    let editOAPIKey = false

    let voices: Voice[]

</script>
<div class="card p-8 rounded-sm flex-flex-col w-[420px]">
    <div class="flex justify-between items-center">
        <span class="text-2xl">
            <p>Settings</p>
        </span>
        <button class="btn" on:click={modalStore.close}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
    </div>

    <hr class="!border-2 mb-2"/>

    <span>ElevenLabs API Key: </span>

    {#if editEAPIKey || !$settingsStore.elevenLabsApiKey}
        <div class="input-group input-group-divider grid-cols-[1fr_auto] rounded-sm my-2">

            <!-- svelte-ignore a11y-autofocus -->
            <input
                required
                autofocus
                class="{!$settingsStore.elevenLabsApiKey ? "input variant-filled-error" : "" } input p-1 rounded-sm outline-none"
                type="text"
                bind:value={$settingsStore.elevenLabsApiKey}
                on:blur={() => (editEAPIKey = false)}
            />
            <button class="input-group-shim btn variant-filled-surface rounded-sm" on:click={setElevenLabsApiKey}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    class="lucide lucide-check">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </button>
        </div>
    {:else}
        <div class="input-group input-group-divider grid-cols-[1fr_auto] rounded-sm my-2">
            <input class="input rounded-sm" value={maskString($settingsStore.elevenLabsApiKey)} disabled/>
            <button class="input-group-shim btn variant-filled-surface rounded-sm" on:click={() => (editEAPIKey = true)}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    class="lucide lucide-pencil">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                </svg>
            </button>
        </div>
    {/if}

    <hr class="mb-2"/>

    <span>OpenAI Api Key: </span>

    {#if editOAPIKey || !$settingsStore.openAiApiKey}
        <div class="input-group input-group-divider grid-cols-[1fr_auto] rounded-sm my-2">

            <!-- svelte-ignore a11y-autofocus -->
            <input
                required
                autofocus
                class="{!$settingsStore.openAiApiKey ? "input variant-filled-error" : "" } input p-1 rounded-sm outline-none"
                type="text"
                bind:value={$settingsStore.openAiApiKey}
                on:blur={() => (editOAPIKey = false)}
            />
            <button class="input-group-shim btn variant-filled-surface rounded-sm" on:click={setOpenAIApiKey}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    class="lucide lucide-check">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </button>
        </div>
    {:else}
        <div class="input-group input-group-divider grid-cols-[1fr_auto] rounded-sm my-2">
            <input class="input rounded-sm" value={maskString($settingsStore.openAiApiKey)} disabled/>
            <button class="input-group-shim btn variant-filled-surface rounded-sm" on:click={() => (editOAPIKey = true)}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    class="lucide lucide-pencil">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                </svg>
            </button>
        </div>

        <hr class="!border-2 mb-2"/>

        {#if $settingsStore.elevenLabsApiKey}
        <div class="flex justify-center">
            <button class="btn variant-filled-surface rounded-sm" on:click={fetchVoices}>Import Voices</button>
        </div>
        {/if}

    {/if}
</div>