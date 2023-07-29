import type { RequestHandler } from "./$types"
// import { ELEVENLABS_API_KEY } from "$env/static/private";

import fs from 'fs'
import path from 'path'

export const POST:RequestHandler = async ({ request, fetch }) => {

    const {message, voice, stability, similarity, elevenLabs} = await request.json()

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
            method: "POST",
            headers: {
                accept: "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": elevenLabs,
            },
            body: JSON.stringify({
                text: message,
                voice_settings: {
                    stability: stability,
                    similarity_boost: similarity,
                },
            }),
        });


        if(!response.ok) {
            throw new Error("Eleven Labs API error")
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const file = Math.random().toString(36).substring(7)

        // console.log(file)

        fs.writeFile(path.join("public", "audio", `${file}.mp3`), buffer, () => {
            console.log(`file written. Filename: ${file}.mp3`)
        })

        return new Response(JSON.stringify({file: `audio/${file}.mp3`}))

    } catch (error) {
        return new Response(JSON.stringify({error: (error as Error).message}))
    }
}