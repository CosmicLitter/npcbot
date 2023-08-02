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
		type ModalComponent 
	} from '@skeletonlabs/skeleton';

	import { defaultVoiceSettings, handleGenerateTTS, showModalComponent } from '$lib/shared';
	import ClientSettings from '$lib/Modals/ClientSettings.svelte';
	import NPCSettings from '$lib/Modals/NPCSettings.svelte';
	import { recentViewerStore, settingsStore, twitchChatStore, voiceWhitelistStore } from '$lib/stores';
	import * as tmi from 'tmi.js'
	import { onDestroy, onMount, tick } from 'svelte';
	import { Viewer, type TwitchChat } from '$lib/types';
	import { get } from 'svelte/store';
	import WhitelistSettings from '$lib/Components/WhitelistSettings.svelte';
	import Whitelist from '$lib/Components/Whitelist.svelte';
	import NPCBot from '$lib/Components/NPCBot.svelte';
	import TwitchChatSettings from '$lib/Components/TwitchChatSettings.svelte';

	onMount(() => {
		// Connect with stored channel when app loads
		if (channel) {
			client.connect()
			console.log(`* Connected to ${channel}`)
			connected = true;
		}
    })

	onDestroy(() => {
		// Disconnect from channel when app is closed
		if (channel) {
			client.disconnect()
			console.log('disconnected')
			connected = false;
		}
    })

	// get route information from layoutload
	export let data

	// Get elevenlabs API from settings for api calls
	const elevenLabs = $settingsStore.elevenLabsApiKey ?? '';	

	let connected = false;
	let channel = $settingsStore?.channel;
	let slug = data.slug
	let twitchChat: HTMLElement
	// let tempQuote = true

	let client = new tmi.client({
		channels: [
			channel || ''
		]
	})

	// Scroll twitch chat as messages come in
	$: {
		if ($twitchChatStore.length > 0) {
			tick().then(() => {
				scrolltoBottom('smooth')
			})
		}
	}

	// Update settings store with new channel then reload the page to connect to new channel
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
	
	// Modal component Registry
	const modalComponentRegistry: Record<string, ModalComponent> = {
		ClientSettings: { ref: ClientSettings },
		NPCSettings: { ref: NPCSettings }
	}

	function scrolltoBottom(behavior?: ScrollBehavior): void {
		twitchChat.scrollTo({
			top: twitchChat.scrollHeight,
			behavior: behavior
		})
	}

	// Send messages to twitchChat store
	function storeChatMessage(username:string, message: string, selected: boolean) {
		const recentViewers = get(recentViewerStore)
		// const twitchChats = get(twitchChatStore)

		const viewer = recentViewers.find(viewer => viewer.username === username)

		if (viewer) {
			const twitchChat: TwitchChat = {
				viewer: viewer,
				message: message,
				selected: selected
			}

			twitchChatStore.update(twitchChats => {
				return [
					...twitchChats,
					twitchChat
				]
			})
		}
	}

	function randomChance(chance: number) {
		return Math.random() < chance;
	}

	client.on('message', (channel, tags, message, self) => {

		const username = tags['display-name']

		if (username && !$recentViewerStore.some(viewer => viewer.username === username)) {
			// Add the username to the recentviewerstore as a new Viewer object
			const viewer = new Viewer(username);
			recentViewerStore.update(viewers => {
				return [
					...viewers,
					viewer
				]
			})
		}

		if (!username) {
			console.log("No display name")
			return
		}

		if (!$settingsStore.readingChance) {
			$settingsStore.readingChance = 0.5;
		}
		const selected = randomChance($settingsStore.readingChance);
		storeChatMessage(username, message, selected)

		if ($settingsStore.randomReading) {
			if (selected) {
				if ($settingsStore.defaultVoice) {
					handleGenerateTTS( $settingsStore.defaultVoice, message, elevenLabs)
				} else {
					handleGenerateTTS( defaultVoiceSettings, message, elevenLabs)
				}
			}
		}
		
		if ($voiceWhitelistStore[username]) {
			if ($settingsStore.viewerVoices) {
				if (!$voiceWhitelistStore[username].mute) {
					handleGenerateTTS( $voiceWhitelistStore[username].voiceSettings, message, elevenLabs, $voiceWhitelistStore[username].quote)
				}
			}
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
			<!-- App Name and home route -->
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase"><a href="/">QuoteBot</a></strong>
			</svelte:fragment>
			<!-- Connect to chat -->
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
	<div class="flex justify-center">
		<div class="container m-2 p-4 rounded-sm flex flex-col gap-4">
			<div class="flex flex-row gap-8">
				<!-- Whitelist Settings -->
				<div class="card rounded-sm variant-glass-surface basis-1/5 border border-surface-500 p-2 drop-shadow-md">
					<WhitelistSettings />
				</div>
				<!-- NPC BotSettings Panel -->
				<div class="card rounded-sm basis-3/5 border border-surface-500 p-2 drop-shadow-md text-center">
					<p>NPC Bot Settings (WIP)</p>
				</div>
				<!-- Live Twitch Chat Settings Panel -->
				<div class="card rounded-sm basis-3/12 border border-surface-500 p-2 drop-shadow-md">
					<TwitchChatSettings />
				</div>
			</div>
			<div class="flex flex-row gap-8">
				<!-- Active chatters and Voice Whitelist Panel -->
				<div class="card rounded-sm basis-1/5 border borderx-none border-surface-500 py-2 drop-shadow-md">
					<Whitelist />
				</div>
				<!-- NPC Bot Panel -->
				<div class="card rounded-sm variant-glass-surface basis-3/5 border border-surface-500 drop-shadow-md">
					<div class="grid grid-cols-[auto_1fr] h-full max-h-[725px]">
						<NPCBot />
						{#key data.slug}
							<slot />
						{/key}
					</div>
				</div>
				<!-- Live Twitch Chat Panel -->
				<div class="card rounded-sm basis-3/12 border border-surface-500 drop-shadow-md overflow-y-auto hide-scrollbar h-[725px]" bind:this={twitchChat}>
					{#each $twitchChatStore as message}
						<div class="grid grid-cols-1">
							<p class={`py-1 ${message.selected ? "variant-outline-warning" : ""}`}><span class={`text-${message.viewer.color}-500`}>{message.viewer.username}</span>: <span class="text-slate-300"> {message.message}</span></p>
							<hr/>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Hidden element to cache text colors. 
		This is needed because tailwind does not properly read the color variable stored for each stored viewer 
		until it has been initialized.
		
		This will need to be updated if new username colors are added.-->
	<div class="hidden">
		<span class=text-blue-500>Blue</span>
		<span class=text-red-500>Red</span>
		<span class=text-green-500>Green</span>
		<span class=text-pink-500>Pink</span>
		<span class=text-purple-500>Purple</span>
		<span class=text-orange-500>Orange</span>
	</div>
</AppShell>
