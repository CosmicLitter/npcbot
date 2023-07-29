import { getErrorMessage, respondToClient, throwIfUnset } from "$lib/error";
import type { ChatCompletionRequestMessage, CreateChatCompletionRequest } from "openai";
import type { RequestHandler } from "./$types";
import { defaultOpenAiSettings, OpenAiModel, type OpenAiSettings } from "$lib/openai";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, fetch }) => {
    try {
        const requestData = await request.json()
        throwIfUnset('request data', requestData)

        const messages: ChatCompletionRequestMessage[] = requestData.messages
        throwIfUnset('messages', messages)
        
        const settings: OpenAiSettings = {
            ...defaultOpenAiSettings,
            model: OpenAiModel.Gpt35Turbo
        }

        const openAiKey: string = requestData.openAiKey
        throwIfUnset('OpenAI API key', openAiKey)

        const completionOpts: CreateChatCompletionRequest = {
            ...settings,
            messages: messages,
            stream: false
        }

        const apiUrl = 'https://api.openai.com/v1/chat/completions'

        const response = await fetch(apiUrl, {
            headers: {
                authorization: `Bearer ${openAiKey}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(completionOpts)
        })

        if (!response.ok) {
            const err = await response.json()
            throw err.error
        }
        const result = await response.json()

        // strip leading and trailing quotes
        const completion = result.choices[0].message.content.replace(/(^['"])|(['"]$)/g, '').trim()

        return respondToClient({ completion })
    } catch (err) {
        throw error(500, getErrorMessage(err))
    }
}