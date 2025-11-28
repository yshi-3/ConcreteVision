async function generateImage() {
    const promptInput = document.getElementById('userInput');
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('output');

    if (!promptInput || !loading || !resultDiv) {
        console.error('Required elements for generateImage are missing.');
        return;
    }

    const prompt = promptInput.value.trim();
    if (!prompt) {
        alert('Please enter a prompt');
        return;
    }

    loading.style.display = 'block';
    resultDiv.innerHTML = '';

    try {
        const response = await fetch('http://localhost:5000/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            let message = `Request failed with status ${response.status}`;
            try {
                const errorPayload = await response.json();
                if (errorPayload && errorPayload.error) {
                    message = errorPayload.error;
                }
            } catch (parseError) {
                // Ignore parse errors; fall back to generic message.
            }
            throw new Error(message);
        }

        const data = await response.json();
        if (!data.image) {
            throw new Error('Response did not include an image payload.');
        }

        const img = document.createElement('img');
        img.id = 'generatedImage';
        img.src = `data:image/png;base64,${data.image}`;
        img.alt = 'Generated visualization';
        img.style.maxWidth = '100%';
        img.style.borderRadius = '8px';
        img.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        img.style.marginTop = '1rem';
        resultDiv.appendChild(img);

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download Image';
        downloadBtn.className = 'download-btn';
        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = img.src;
            link.download = `generated-${Date.now()}.png`;
            link.click();
        });
        resultDiv.appendChild(downloadBtn);
    } catch (error) {
        console.error('Image generation failed:', error);
        resultDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    } finally {
        loading.style.display = 'none';
    }
}
