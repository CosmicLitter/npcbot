import { json } from "@sveltejs/kit";

export const POST = async (event) => {
    console.log('server reached')
    try {
        const requestBody = await event.request.formData();
        const requestFile = requestBody.get('audio');
        const OPENAI_KEY = requestBody.get('apikey');
        console.log(OPENAI_KEY)
    
        /**
         * Request config.
         */
        const file = new Blob([requestFile as BlobPart], { type: 'audio/wav' });

        console.log(file)
    
        const formData = new FormData();
        formData.append('file', file, 'test.wav');
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');
    
        /**
         * https://platform.openai.com/docs/api-reference/audio/create
         */
        const transcriptionResponse = await fetch(
            `https://api.openai.com/v1/audio/transcriptions`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${OPENAI_KEY}`,
                    Accept: 'application/json'
                },
                body: formData
            }
        );
    
        const data = await transcriptionResponse.json();
        console.log(data)
        const transcribedText = data?.text || '';
    
        return json({ transcribedText });
    } catch (error) {
        console.error(error);
    }
};