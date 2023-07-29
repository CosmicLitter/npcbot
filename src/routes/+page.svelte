<script lang="ts">
	import { recentViewerStore, settingsStore } from "$lib/stores";
	import type { ViewerSettings } from "$lib/types";
	import { modalStore, type ModalSettings, RangeSlider, SlideToggle } from "@skeletonlabs/skeleton";

    let voiceWhitelist = $settingsStore.usersVoice?.voiceWhitelist ?? [];
    let newWhitelistUser: string = "";
    let ignoreQuote = $settingsStore.ignoreQuote ?? false;




    const addWhitelist = (user: string) => {
  		console.log(user);
		// const voiceWhitelist: ViewerSettings[] = []

		if (!voiceWhitelist.some(whitelist => whitelist.viewerName === user)) {
			const viewerSettings: ViewerSettings = {
				viewerName: user,
				voiceSettings: {
					voice: "AZnzlk1XvdvUeBnXmlld",
					stability: 0.30,
					similarity: 0.30
				}
			}
			voiceWhitelist.push(viewerSettings);
		}
		console.log(voiceWhitelist)

		settingsStore.update(settings => {
			return {
				...settings,
				usersVoice: {
					voiceWhitelist
				}
			}
		})
	};

    const updateVoice = (event: any, user: ViewerSettings) => {
		// console.log(usersVoice)
		// console.log('updating voice')
		// console.log(user)

		// update voiceWhitelist for the user
		voiceWhitelist = voiceWhitelist.map((whitelist) => {
			if (whitelist.viewerName === user.viewerName) {
				return {
					...whitelist,
					voiceSettings: {
						...whitelist.voiceSettings,
						[event.target!.name]: event.target!.value
					}
				}
			} else {
				return whitelist
			}
		})

		// update settings store with the new voiceWhitelist
		settingsStore.update(settings => {
			return {
				...settings,
				usersVoice: {
					voiceWhitelist
				}
			}
		})		
		
	}

    async function modalConfirmDelete(user: ViewerSettings) {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Please confirm',
			body: `Remove ${user.viewerName} from whitelist?`,
			response: (result: boolean) => {
				if (result) {
					settingsStore.update(settings => {
						voiceWhitelist = (voiceWhitelist ?? []).filter((u) => u !== user);
						return {
							...settings,
							usersVoice: {
								voiceWhitelist: settings.usersVoice?.voiceWhitelist?.filter((u) => u !== user)
							}
						}
					})
				}
			}
		}
		modalStore.trigger(modal)
	}

    function quoteToggle() {
		return () => {
			settingsStore.update(settings => {
				return {
					...settings,
					ignoreQuote
				};
			});
		}
	}
    
</script>

<div class="container h-full space-x-4 mx-auto flex justify-center items-center">
	<!-- List viewers who have sent a message in chat -->
	<div class="card p-4 rounded-sm drop-shadow-md h-[550px] w-[400px] flex flex-col">
		<span class="text-xl">Active in chat</span>
		<hr class="!border-2 mb-2"/>
		<div class="overflow-y-auto">
			{#each $recentViewerStore as viewer}
				<div class="input-group input-group-divider my-1 rounded-sm grid grid-cols-[1fr_auto]">
					<span class="px-2 flex items-center">{viewer} </span>
					<button class="btn btn-small rounded-sm input-group-shim" on:click={() => addWhitelist(viewer)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#84cc16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
				</div>
			{/each}
		</div>
	</div>
	<!-- Whitelist viewers to assign a voice -->
	<div class="card p-4 rounded-sm drop-shadow-md h-[550px] w-[400px] flex flex-col">
		<span class="text-xl">Voice Whitelist</span>
		<div class="input-group input-group-divider rounded-sm grid grid-cols-[1fr_auto]">
			<input class="input rounded-sm" type="text" placeholder="Add user..." bind:value={newWhitelistUser} />
			<button class="input-group-shim rounded-sm btn btn-small" on:click={() => addWhitelist(newWhitelistUser)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#84cc16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
		</div>
		<hr class="!border-2 my-2"/>
		<div class="overflow-y-auto">
			{#each $settingsStore.usersVoice?.voiceWhitelist || [] as user}
			<!-- Viewer control panel -->
			<div class="card rounded-sm flex flex-col">
				<div class="input-group drop-shadow-md input-group-divider rounded-sm grid-cols-[150px_1fr_auto]">
					<!-- Select voice -->
					<span class="pr-2 flex items-center">{user.viewerName}</span>


					<select class="select rounded-sm" bind:value={user.voiceSettings.voice} on:change={(event) => updateVoice(event, user)} >
						{#each $settingsStore.voiceLibrary ?? [] as voice}
							<option value={voice.id}>{voice.name}</option>
						{/each}
					</select>
					
					<!-- Remove from whitelist -->
					<button class=" input-group-shim rounded-sm btn btn-small" on:click={() => {modalConfirmDelete(user)}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"/></svg>
                    </button>
				</div>
				<!-- Voice stability and similarity sliders -->
				<div class="grid grid-cols-[auto_auto]">
					<RangeSlider 
						name="stability" 
						min={0} 
						max={1} 
						step={0.01} 
						bind:value={user.voiceSettings.stability} 
						on:change={(event) => updateVoice(event, user)}
					/>
					<RangeSlider name="similarity" min={0} max={1} step={0.01} bind:value={user.voiceSettings.similarity} on:change={(event) => updateVoice(event, user)}/>
				</div>
			</div>
			<hr class=" mb-2" />
			{/each}
		</div>
	</div>
	<!-- <div class="space-y-3 card p-4 rounded-sm text-center flex flex-col items-center">
		<span class="text-xl">Channel</span>
		<span class="text-sm">For now, page will need a refresh to connect.</span>
		<span class="text-sm">Reload the page after setting</span>
		<div class="flex flex-row">
			<input class="input rounded-sm" type="text" bind:value={channel} />
			<button class="btn { $settingsStore.channel ? 'variant-filled-success' : 'variant-filled-surface' } rounded-sm" on:click={() => settingsStore.update(settings => {
				return {
					...settings,
					channel
				};
			})}>Set</button>
		</div>
		<span class="text-xl">Quote User</span>
		<div class="flex flex-row">
			<input class="input rounded-sm" type="text" bind:value={quoteUser} />
			<button class="btn { $settingsStore.quoteUser ? 'variant-filled-success' : 'variant-filled-surface' } rounded-sm" on:click={() => settingsStore.update(settings => {
				return {
					...settings,
					quoteUser
				};
			})}>Set</button>
		</div>
		
	</div> -->
	<div class="space-y-3 card p-4 rounded-sm text-center flex flex-col items-center">
		<span class="text-xl">Voice</span>
		<!-- <select bind:value={voice} class="select rounded-sm">
			{#each Object.keys(voiceMap) as voiceName}
				<option value={voiceMap[voiceName].id}>{voiceMap[voiceName].name}</option>
			{/each}
		</select> -->
		<!-- <RangeSlider name="stability-slider" min={0} max={1} step={0.01} bind:value={stability}>
			<div class="flex justify-between items-center">
				<div class="font-bold">Stability:</div>
				<div class="text-xs">{stability}</div>
			</div>
		</RangeSlider>
		<RangeSlider name="similarity-slider" min={0} max={1} step={0.01} bind:value={similarity}>
			<div class="flex justify-between items-center">
				<div class="font-bold">Similarity:</div>
				<div class="text-xs">{similarity}</div>
			</div>
		</RangeSlider> -->
		<hr />
		<span class="text-sm">enable to read FULL message</span>
		<div class="flex flex-row space-x-4">
			<SlideToggle name="ignoreQuote" bind:checked={ignoreQuote} on:change={quoteToggle()} size="sm" />
			<span>Ignore Quote </span>
		</div>
		<!-- {$settingsStore.voice}
		{$settingsStore.stability}
		{$settingsStore.similarity} -->
	</div>
	<!-- <div class="space-y-3 card p-4 rounded-sm text-center flex flex-col items-center">
		<span class="text-xl">Random Reading</span>
		<div class="flex flex-row space-x-4">
			<SlideToggle name="rReading" bind:checked={rReading} on:change={rReadingToggle()} size="sm" />
			<span>{rReading ? "Enabled" : "Disabled"}</span>
		</div>
		<RangeSlider name="rReading-slider" min={0} max={1} step={0.01} bind:value={rReadingChance}>
			<div class="flex justify-between items-center">
				<div class="font-bold">Chance:</div>

				{#if $settingsStore.rReadingChance !== undefined}
					<div class="text-xs">{Math.round($settingsStore.rReadingChance * 100)}%</div>
				{/if}
			</div>
		</RangeSlider>
		<hr />
		<span class="text-xl">Response</span>
		<div class="flex flex-row space-x-4">
			<SlideToggle name="respond" bind:checked={respond} on:change={respondToggle()} size="sm" />
			<span>{respond ? "Enabled" : "Disabled"}</span>
		</div>
		<textarea class="textarea rounded-sm w-64 h-32" bind:value={prompt} />
	</div> -->
</div>