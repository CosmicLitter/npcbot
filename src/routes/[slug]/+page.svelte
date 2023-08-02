<script lang="ts">
	import { goto } from '$app/navigation';
	import { gptRequest, handleGenerateTTS } from '$lib/shared';
	import { isLoadingAnswerStore, npcChatStore, settingsStore } from '$lib/stores';
	import type { ChatCompletionRequestMessage } from 'openai';
	import { onMount, onDestroy, tick } from 'svelte';
    export let data

    // Log when the component is mounted and destroyed
    onMount(() => {
        console.log(`mounted ${data.slug}`)
        scrollChatBottom('smooth')
    })
    onDestroy(() => {
        console.log(`destroyed ${data.slug}`)
    })

    let inputMessage: string = ""
    let inputMessageCopy: string = ""
    let npcChatScroll: HTMLElement
    let chat: ChatCompletionRequestMessage[]
    let debounceTimer: number | undefined;
    let isRecording = false;
    let mediaRecorder: MediaRecorder | undefined;
    let chunks: BlobPart[] = [];
    let transcription: string = '';
    let recording: Blob | undefined;

    // const quote = true

    if (!data.slug) {
        goto('/')
    }

    function scrollChatBottom(behavior?: ScrollBehavior): void {
        npcChatScroll.scrollTo({ top: npcChatScroll.scrollHeight, behavior })
    }

    async function sendMessage() {
        isLoadingAnswerStore.set(true)
        inputMessageCopy = inputMessage
        console.log(`adding message: ${inputMessage}`)
        const message = {
            role: 'user',
            content: inputMessage.trim()
        } as ChatCompletionRequestMessage
        npcChatStore.addMessageToNpcChat(data.slug!, message)
        scrollChatBottom('smooth')

        inputMessage = ""

        if (!$settingsStore.openAiApiKey) {
            alert("Please enter your OpenAI API key in the settings page.")
            return
        }

        try {
            const npcResponse = await gptRequest($npcChatStore[data.slug!], $settingsStore.openAiApiKey)
            npcChatStore.addMessageToNpcChat(data.slug!, {role: 'assistant', content: npcResponse})
            scrollChatBottom('smooth')

            if (!$settingsStore.elevenLabsApiKey) {
                alert("Please enter your Eleven Labs API key in the settings page.")
                return
            }

            isLoadingAnswerStore.set(false)

            handleGenerateTTS($npcChatStore[data.slug!].voice, npcResponse, $settingsStore.elevenLabsApiKey)

        } catch {
            alert("There was an error with the openAI Response.")
            inputMessage = inputMessageCopy
            return
        }



    }

    function handleKeyDown(event: KeyboardEvent) {
		clearTimeout(debounceTimer);

		if ($isLoadingAnswerStore) {
			return;
		}

		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

    function pttDown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === ';') {
            if (!isRecording) {
                isRecording = true;
                startRecording()
            }
        }
    }

    function pttUp(event: KeyboardEvent) {
        if (event.key === ';' && isRecording) {
            isRecording = false;
            stopRecording()
        }
    }

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.addEventListener('dataavailable', (event) => {
                chunks.push(event.data);
            })
            mediaRecorder.addEventListener('stop', () => {
                const blob = new Blob(chunks, { type: 'audio/wave' });
                chunks = [];
                recording = blob;
                sendRecording();
            });
            mediaRecorder?.start();
            isRecording = true;
        })
    }

    const stopRecording = () => {
        mediaRecorder?.stop();
        isRecording = false;
    }

    async function sendRecording() {
        isLoadingAnswerStore.set(true)
        try{
            const formData = new FormData();
            formData.append('audio', recording as Blob, 'recording.wav');
            formData.append('apikey', $settingsStore.openAiApiKey as string);
                const response = await fetch('/api/transcription', {
                    method: 'POST',
                    body: formData
            }).then((res) => res.json())
    
            transcription = response?.transcribedText;
            inputMessage = transcription
            sendMessage()
            return response
        } catch {
            alert("There was an error with the transcription.")
            isLoadingAnswerStore.set(false)
            return
        }
    }



    $: {
        if ($npcChatStore[data.slug!]) {
            chat = $npcChatStore[data.slug!].messages
        } else {
            goto('/')
        }
        tick().then(() => {
            scrollChatBottom('smooth')
        })
    }


</script>


<div class="flex flex-col bg-surface-900 overflow-y-auto">
    <div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-sm order-last max-h-[100px] z-10 mt-auto">
        <button 
            class={isRecording ? 'variant-soft-primary' : 'input-group-shim'}
            on:click={isRecording ? stopRecording : startRecording}
            disabled={$isLoadingAnswerStore}>
            {#if isRecording}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            {:else}              
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic-off"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            {/if}
        </button>
        <textarea
            bind:value={inputMessage}
            class="bg-transparent border-0 ring-0 resize-none"
            name="prompt"
            id="prompt"
            placeholder="Enter your message here or press 'ctrl + ;' to use push to talk"
            on:keydown={handleKeyDown}
            rows="3"
        />
        <button class="btn variant-filled-surface rounded-sm" on:click={sendMessage} disabled={$isLoadingAnswerStore}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send-horizonal"><path d="m3 3 3 9-3 9 19-9Z"/><path d="M6 12h16"/></svg>
        </button>
    </div>
    <div class="h-full w-full overflow-y-auto" bind:this={npcChatScroll}>
        {#each chat as message}
            <div class={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'} m-4 drop-shadow-lg`}>
                <div class={`${message.role === 'assistant' ? 'bg-surface-700 rounded-tl-none' : 'bg-surface-500 rounded-tr-none'} whitespace-pre-wrap rounded-xl border border-secondary-800  max-w-md p-4`}>
                    {message.content}
                </div>    
            </div>
        {/each}
        <!-- {JSON.stringify(selectedNPC[0], null, 2)} -->
    </div>
</div>
<svelte:window on:keydown={pttDown} on:keyup={pttUp} />

