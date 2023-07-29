import { modalStore, type ModalSettings } from "@skeletonlabs/skeleton";
import type { ChatCompletionRequestMessage } from "openai";
import { defaultOpenAiSettings, type OpenAiSettings } from "$lib/openai";
import { get } from "svelte/store";
import { npcChatStore, settingsStore, navStore } from "$lib/stores";
import type { NpcChat, VoiceSettings } from "$lib/types";
import { goto } from "$app/navigation";

export function showModalComponent(
    component: string,
    meta?: object,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response?: ((r: any) => void) | undefined
) {
    const modal: ModalSettings = {
        type: 'component',
        component,
        meta,
        response
    };
    modalStore.trigger(modal);
}

export function createNewNpcChat(template?: {
    name?: string
    // description?: string
    voice?: VoiceSettings
    systemPrompt?: string
    settings?: OpenAiSettings
    messages?: ChatCompletionRequestMessage[]
}) {
    const settings = {...(template?.settings || defaultOpenAiSettings) }
    const voice = {...(template?.voice || defaultVoiceSettings)}
    const { defaultModel } = get(settingsStore)
    if (defaultModel) {
        settings.model = defaultModel
    }

    const slug = generateID()
    const npcChat: NpcChat = {
        name: template?.name || '',
        // description: template?.description || '',
        voice,
        settings,
        systemPrompt: {
            role: 'system',
            content: template?.systemPrompt || ''
        },
        messages: template?.messages || []
    } 
    npcChatStore.updateNpcChat(slug, npcChat)
    navStore.update((value) => [...value, slug])

    goto(`/${slug}`)
}

export function generateID(): string {
    return (Math.floor(Math.random() * 1000000000) + 100000).toString();
}

export async function getVoices(elevenLabs: string) { 
    console.log("retrieving voices")

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
            'accept': 'application/json',
            'xi-api-key': elevenLabs
        }
    })


    const voiceLibrary = await response.json()

    // loop through voiceLibrary and retrieve the voice id and voice names from each item into its own array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const voices = voiceLibrary.voices.map((voice: any) => {
        return { id: voice.voice_id, name: voice.name }
    })

    // Update the settings store with the new voices
    settingsStore.update((settings) => {
        return { ...settings, voiceLibrary: voices }
    })

    return voices
}

export async function gptRequest(npcChat: NpcChat, openAiApiKey: string): Promise<string> {
    const messages = [npcChat.systemPrompt, ...npcChat.messages]

    const response = await fetch('/api/npcbot', {
        method: 'POST',
        body: JSON.stringify({
            messages,
            openAiKey: openAiApiKey
        })
    })
    const { completion }: { completion: string } = await response.json()
    return Promise.resolve(completion)
}

export const defaultVoiceSettings: VoiceSettings = {
    voice: "21m00Tcm4TlvDq8ikWAM",
    stability: 0.3,
    similarity: 0.3
}

export interface Voice {
    id: string;
    name: string;
}

export const handleGenerateTTS = async (voiceSettings: VoiceSettings, message: string, elevenLabs: string, quote = false) => {
	let text = message;
	const voice = voiceSettings.voice;
	const stability = voiceSettings.stability;
	const similarity = voiceSettings.similarity;

    if (!quote) {
		// Pull the quote out of the message
		const getTextWithinQuotes = (input: string): string => {
			// A regular expression that matches the text within double quotes
			const match = input.match(/"([^"]+)"/);
			if (match) {
				return match[1];
			}
			return '';
		}
		text = getTextWithinQuotes(text);
	}

	if (text.length > 0) {
		
	try {

		const response = await fetch("/api/elevenlabs", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ 
				message: text,
				voice: voice,
				stability: stability,
				similarity: similarity,
				elevenLabs: elevenLabs
			})
		})

		if (!response.ok) {
			throw new Error("Something went wrong")
		}

		const { file } = await response.json()

		console.log(file)
		
		// Create an Audio object and set its src attribute to the URL of the audio file
		const audio = new Audio(`/public/${file}`);

		audioArray.push(audio);

		audio.addEventListener('ended', () => {
			const index = audioArray.indexOf(audio);
			if (index > -1) {
			audioArray.splice(index, 1);
			}
			if (audioArray.length > 0) {
			audioArray[0].play();
			}
		});

		if (audioArray.length === 1) {
			audio.play();
		}

	} catch (error) {
		console.log(error)
	}}
}

const audioArray: HTMLAudioElement[] = [];
