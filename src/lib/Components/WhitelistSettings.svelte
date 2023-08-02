<script lang="ts">
	import { addViewer } from "$lib/shared";
	import { settingsStore } from "$lib/stores";
    import { SlideToggle } from "@skeletonlabs/skeleton";

    let viewerVoices = $settingsStore.viewerVoices ?? false
    let username = ''

    function viewerVoicesToggle() {
        return () => {
            settingsStore.update(settings => {
                return {
                    ...settings,
                    viewerVoices
                }
            })
        }
    }


</script>

<div class="flex justify-center mb-2 text-slate-400">
    <SlideToggle name="viewerWhiteList" size="sm" bind:checked={viewerVoices} on:change={viewerVoicesToggle()}>
        Viewer Voices: <span class={viewerVoices ? 'text-green-500' : 'text-red-500'}>
            {viewerVoices ? "Enabled" : "Disabled"}
        </span>
    </SlideToggle>
</div>
<div class="input-group input-group-divider rounded-sm grid grid-cols-[1fr_auto]">
    <input class="input rounded-sm" type="text" placeholder="Add a user to the whitelist" bind:value={username} />
    <button class="input-group-shim rounded-sm btn btn-small" on:click={()=> addViewer(username)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#84cc16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    </button>
</div>

