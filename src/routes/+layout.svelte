<script lang='ts'>
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-crimson.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';

	import { AppShell, 
		AppBar, 
		Modal, 
		Toast, 
		toastStore, 
		type ToastSettings, 
		type ModalComponent 
	} from '@skeletonlabs/skeleton';

	import { handleGenerateTTS, showModalComponent } from '$lib/shared';
	import ClientSettings from '$lib/Modals/ClientSettings.svelte';
	import NPCSettings from '$lib/Modals/NPCSettings.svelte';
	import { recentViewerStore, settingsStore } from '$lib/stores';
	import * as tmi from 'tmi.js'
	import { onDestroy, onMount } from 'svelte';

	const elevenLabs = $settingsStore.elevenLabsApiKey ?? '';	
	let connected = false;
	let channel = $settingsStore?.channel;
	let lastMessage = "";
	let viewers: string[] = [];
	$: ignoreQuote = $settingsStore.ignoreQuote ?? false;



	let client = new tmi.client({
		channels: [
			channel || ''
		]
	})

	

	

	const connectChannel = () => {
		// client.connect()
		
		settingsStore.update(settings => {
			return {
				...settings,
				channel: channel?.toLowerCase() ?? ''
			};
		});
		location.reload();
	}
	
	onMount(() => {
		if (channel) {
			client.connect()
			console.log(`* Connected to ${channel}`)
			connected = true;
		}
    })

	onDestroy(() => {
		// client.removeListener('join', onJoin);
		if (channel) {
			client.disconnect()
			console.log('disconnected')
			connected = false;
		}
    })

	const modalComponentRegistry: Record<string, ModalComponent> = {
		ClientSettings: { ref: ClientSettings },
		NPCSettings: { ref: NPCSettings }
	}

	client.on('message', (channel, tags, message, self) => {
		// console.log(`${tags['display-name']}: ${message}`)
		lastMessage = message;
		// message = `${tags['display-name']}: ${message}`
		// if ($settingsStore.rReading == true) {
		// 	randomChance()
		// }
		if (tags['display-name'] && !viewers.includes(tags['display-name'])) {
			viewers.push(tags['display-name']);
			recentViewerStore.update(viewers => {
				return [...viewers, tags['display-name']].filter(name => name !== undefined) as string[];
			});
		}
		// viewerSettings will be undefined if no matching viewer is found
		const viewerSettings = $settingsStore.usersVoice?.voiceWhitelist?.find(viewer => viewer.viewerName === tags['display-name']);
			if (viewerSettings) {
				handleGenerateTTS(viewerSettings.voiceSettings, message, elevenLabs, ignoreQuote)
			}

	})
</script>

<Modal components={modalComponentRegistry}/>
<Toast />

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar slotDefault="place-self-center">
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase"><a href="/">QuoteBot</a></strong>
			</svelte:fragment>
			<div class="btn-group rounded-sm">
				<!-- <a href="/quote" class="btn variant-filled-surface p-2 rounded-sm"> Quote </a> -->
				<a href="/chat" class="btn variant-filled-surface p-2 rounded-sm"> Chat </a>
			</div>

			<svelte:fragment slot="trail">
				<div class="input-group grid-cols-[auto_1fr_auto] rounded-sm input-group-divider">
					<span class="px-2 flex items-center">
						{#if connected}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap-off"><polyline points="12.41 6.75 13 2 10.57 4.92"/><polyline points="18.57 12.91 21 10 15.66 10"/><polyline points="8 8 3 14 12 14 11 22 16 16"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
						{/if}
					</span>
					<input class="input rounded-sm" type="text" spellcheck="false" placeholder="Channel to Connect to..." bind:value={channel}/>
					<button class="btn variant-filled-surface rounded-sm" on:click={connectChannel}>Connect</button>
				</div>
				<button class="btn " on:click={()=> showModalComponent('ClientSettings')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
				</button>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
