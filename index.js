document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const promptInput = document.getElementById('prompt');
    const loadingIndicator = document.getElementById('loading');
    const resultDiv = document.getElementById('result');

    if (!generateBtn || !promptInput || !loadingIndicator || !resultDiv) {
        return;
    }

    generateBtn.addEventListener('click', generateImage);

    async function generateImage() {
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            alert('Please enter a prompt');
            return;
        }

        // Clear previous results and show loading
        resultDiv.innerHTML = '';
        loadingIndicator.style.display = 'block';

        try {
            const response = await fetch('http://localhost:5000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt }),
            });

            if (!response.ok) {
                let message = `Request failed with status ${response.status}`;
                try {
                    const errorPayload = await response.json();
                    if (errorPayload && errorPayload.error) {
                        message = errorPayload.error;
                    }
                } catch (parseError) {
                    // ignore parse errors
                }
                throw new Error(message);
            }

            const data = await response.json();
            if (!data.image) {
                throw new Error('Response did not include an image payload.');
            }
            
            // Create and display image
            const img = document.createElement('img');
            img.src = `data:image/png;base64,${data.image}`;
            img.alt = 'Generated image';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.marginTop = '20px';
            
            // Create download button
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Download Image';
            downloadBtn.className = 'download-btn';
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = img.src;
                link.download = `generated-${Date.now()}.png`;
                link.click();
            };

            // Append elements to result div
            resultDiv.appendChild(img);
            resultDiv.appendChild(document.createElement('br'));
            resultDiv.appendChild(downloadBtn);

        } catch (error) {
            console.error('Error:', error);
            resultDiv.innerHTML = `
                <div class="error">
                    <p>Failed to generate image</p>
                    <p>${error.message}</p>
                </div>
            `;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }
});
