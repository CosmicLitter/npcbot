<script lang="ts">
	import { settingsStore } from "$lib/stores";
	import { RangeSlider, SlideToggle } from "@skeletonlabs/skeleton";
    let randomReading = $settingsStore.randomReading ?? false


    function randomReadingToggle() {
        return () => {
            settingsStore.update(settings => {
                return {
                    ...settings,
                    randomReading
                }
            })
        }
    }
</script>

<div class="flex flex-row justify-center w-full text-slate-400">
    <SlideToggle bind:checked={randomReading} on:change={randomReadingToggle()} name="randomReading" size="sm">
        Random Reading: <span class={randomReading ? 'text-green-500' : 'text-red-500'}> 
            {randomReading ? "Enabled" : "Disabled"}
        </span>
    </SlideToggle>
</div>
<RangeSlider name="rReading-slider" min={0} max={1} step={0.01} bind:value={$settingsStore.readingChance}>
    <div class="flex justify-between items-center">
        <div class="font-bold">Chance:</div>

        {#if $settingsStore.readingChance !== undefined}
            <div class="text-xs">{Math.round($settingsStore.readingChance * 100)}%</div>
        {/if}
    </div>
</RangeSlider>