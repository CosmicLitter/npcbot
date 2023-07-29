<script lang="ts">
	import { goto } from '$app/navigation';
	import { gptRequest, handleGenerateTTS } from '$lib/shared';
	import { isLoadingAnswerStore, npcChatStore, settingsStore } from '$lib/stores';
	import type { ChatCompletionRequestMessage } from 'openai';
	import { onMount, onDestroy } from 'svelte';
    export let data

    // Log when the component is mounted and destroyed
    onMount(() => {
        console.log(`mounted ${data.slug}`)
    })
    onDestroy(() => {
        console.log(`destroyed ${data.slug}`)
    })

    const quote = true

    async function sendMessage() {
        // isLoadingAnswerStore.set(true)
        inputMessageCopy = inputMessage
        console.log(`adding message: ${inputMessage}`)
        const message = {
            role: 'user',
            content: inputMessage.trim()
        } as ChatCompletionRequestMessage
        npcChatStore.addMessageToNpcChat(data.slug, message)

        if (!$settingsStore.openAiApiKey) {
            alert("Please enter your OpenAI API key in the settings page.")
            return
        }

        const npcResponse = await gptRequest($npcChatStore[data.slug], $settingsStore.openAiApiKey)

        npcChatStore.addMessageToNpcChat(data.slug, {role: 'assistant', content: npcResponse})

        if (!$settingsStore.elevenLabsApiKey) {
            alert("Please enter your Eleven Labs API key in the settings page.")
            return
        }

        handleGenerateTTS($npcChatStore[data.slug].voice, npcResponse, $settingsStore.elevenLabsApiKey, quote)

        inputMessage = ""
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


    const startRecording = () => {
        console.log('startRecording Called')
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.addEventListener('dataavailable', (event) => {
                chunks.push(event.data);
                console.log(chunks)
            })
            mediaRecorder.addEventListener('stop', () => {
                const blob = new Blob(chunks, { type: 'audio/wave' });
                chunks = [];
                console.log(blob)
                recording = blob;
                sendRecording();
            });
            mediaRecorder?.start();
            isRecording = true;
        })
    }

    const stopRecording = () => {
        console.log('stopRecording Called')
        mediaRecorder?.stop();
        isRecording = false;
    }

    async function sendRecording() {
        const formData = new FormData();
        formData.append('audio', recording as Blob, 'recording.wav');
        formData.append('apikey', $settingsStore.openAiApiKey as string);
            console.log('send to server')
            console.log(formData)
            console.log(recording)
            const response = await fetch('/api/transcription', {
                method: 'POST',
                body: formData
        }).then((res) => res.json())

        transcription = response?.transcribedText;
        console.log(transcription)
        inputMessage = transcription
        sendMessage()
        return response
    }

    let inputMessage: string = ""
    let inputMessageCopy: string = ""

    // $: message = {
    //     role: 'user',
    //     content: inputMessage.trim()
    // } as ChatCompletionRequestMessage

    let chat: ChatCompletionRequestMessage[]
    let debounceTimer: number | undefined;
    let isRecording = false;
    let mediaRecorder: MediaRecorder | undefined;
    let chunks: BlobPart[] = [];
    let transcription: string = '';
    let recording: Blob | undefined;

    $: {
        // if (data.slug != "chat") {
        //     console.log(data.slug)
        //     chat = $npcChatStore[data.slug].messages || []
        // }
        if ($npcChatStore[data.slug]) {
            chat = $npcChatStore[data.slug].messages
        } else {
            goto('/chat')
        }
    }


</script>
<div>
    {#if data.slug != "chat"}
        <div class="flex justify-center">
            <button
            class="btn variant-filled-surface rounded-sm" 
            on:click={(event) => {npcChatStore.clearNpcChat(data.slug); return event;}}
            >
                Clear
            </button>
        </div>
    
        <div class=" h-[500px] flex flex-col">
            <div class="h-full overflow-y-auto">
                {#each chat as message}
                    <div class={`${message.role === 'assistant' ? 'bg-surface-700' : 'bg-surface-500'} flex justify-center whitespace-pre-wrap drop-shadow-lg`}>
                        <div class="w-full max-w-3xl p-4">
                            {message.content}
                        </div>    
                    </div>
                {/each}
            </div>
            <div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-sm order-last max-h-[100px] z-10 mt-auto">
                <button 
                    class={isRecording ? 'variant-filled-primary' : 'input-group-shim'} 
                    on:click={isRecording ? stopRecording : startRecording}>
                    <!-- <Mic /> -->Record
                </button>
                <textarea
                    bind:value={inputMessage}
                    class="bg-transparent border-0 ring-0 resize-none"
                    name="prompt"
                    id="prompt"
                    placeholder="Enter your message here..."
                    on:keydown={handleKeyDown}
                    rows="3"
                />
                <button class="btn variant-filled-surface rounded-sm" on:click={sendMessage}>Send</button>
            </div>
        </div>
    {/if}
</div>