import type { ChatCompletionRequestMessage } from "openai";
import type { OpenAiModel, OpenAiSettings } from "$lib/openai";
import { defaultVoiceSettings } from "./shared";

export interface ClientSettings {
    channel?: string;
    elevenLabsApiKey?: string;
    openAiApiKey?: string;
    defaultModel?: OpenAiModel;
    voiceLibrary?: Voice[];
    // ignoreQuote?: boolean;
    // usersVoice?: {
    //     voiceWhitelist?: ViewerSettings[];
    // }
    randomReading?: boolean
    readingChance?: number
    viewerVoices?: boolean
    defaultVoice?: VoiceSettings
}



export interface ViewerSettings {
    voiceSettings: VoiceSettings;
    quote: boolean;
    mute: boolean;
}

export interface TwitchChat {
    viewer: Viewer
    message: string
    selected: boolean
}

export interface NpcChat {
    name: string
    // description: string
    voice: VoiceSettings
    settings: OpenAiSettings
    systemPrompt: ChatCompletionRequestMessage
    messages: ChatCompletionRequestMessage[]
}

export interface CharacterTemplate {
    name?: string
    systemPrompt?: string
    voice?: VoiceSettings
}

export interface VoiceSettings {
    voice: string;
    stability: number;
    similarity: number;
}

export interface Voice {
    id: string;
    name: string;
}

export class Character {
    // id: string;
    name: string;
    description: string;
    systemPrompt: string;
    voiceSettings: VoiceSettings;

    constructor() {
        this.name = ''
        this.description = ''
        this.systemPrompt = ''
        this.voiceSettings = defaultVoiceSettings
    }
}

export class Viewer {
    username: string
    color: string
    static colors = ["red", "blue", "green", "purple", "pink", "orange"]

    constructor(username: string) {
        this.username = username
        this.color = Viewer.colors[Math.floor(Math.random() * Viewer.colors.length)]
    }
}
