<script lang="ts">
	import { defaultVoiceSettings } from "$lib/shared";
	import { settingsStore } from "$lib/stores";
	import type { Character } from "$lib/types";
	import { RangeSlider, modalStore } from "@skeletonlabs/skeleton";


    let npc: Character = $modalStore[0].meta?.character
    // console.log(defaultVoiceSettings)
    npc.voiceSettings = {
        voice: "21m00Tcm4TlvDq8ikWAM",
        stability: 0.3,
        similarity: 0.3
    }
    // console.log(npc)

    const addNpc = () => {
        npc.systemPrompt = `${npc.description} Act as ${npc.name} and provide a natural conversation with the user. Keep responses to a maximum of 2 or 3 sentences.`
        console.log("Adding NPC")
        if ($modalStore[0].response) {
            $modalStore[0].response(npc)
        }
        modalStore.close()
    }
    
</script>

<div class="card rounded-sm p-4 w-[420px]">
    <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">NPC Settings</h2>
        <button class="btn btn-small" on:click={() => modalStore.close()}>x</button>
    </div>
    <div class="flex flex-col space-y-4">
        <div class="flex flex-col space-y-2">
            <label class= "text-xl" for="name">NPC Name</label>
            <input type="text" id="name" class="input input-bordered rounded-sm" bind:value={npc.name} autocomplete="off" />
        </div>
        <div class="flex flex-col space-y-2">
            <label class= "text-xl" for="prompt">NPC Description</label>
            <textarea 
                id="prompt" 
                class="input input-bordered rounded-sm max-h-[400px]" 
                placeholder="Provide a personality description for the npc you want to create..." 
                bind:value={npc.description}
                rows="5"/>
        </div>
        <div class="flex flex-col space-y-2">
            <label class= "text-xl" for="Voice">Voice</label>
            <select class="select rounded-sm" bind:value={npc.voiceSettings.voice}>
                {#each $settingsStore.voiceLibrary ?? [] as voice}
                    <option value={voice.id}>{voice.name}</option>
                {/each}
            </select>
            <RangeSlider name="stability-slider" min={0} max={1} step={0.01} bind:value={npc.voiceSettings.stability}>
			<div class="flex justify-between items-center">
				<div>Stability:</div>
				<div class="text-xs">{npc.voiceSettings.stability}</div>
			</div>
            </RangeSlider>
            <RangeSlider name="similarity-slider" min={0} max={1} step={0.01} bind:value={npc.voiceSettings.similarity}>
                <div class="flex justify-between items-center">
                    <div>Similarity:</div>
                    <div class="text-xs">{npc.voiceSettings.similarity}</div>
                </div>
            </RangeSlider>
        </div>
        <div class="flex justify-end">
            <button class="btn btn-small" on:click={() => modalStore.close()}>Cancel</button>
            <button class="btn btn-small btn-primary" on:click={addNpc}>Save</button>
        </div>
    </div>
</div>