// HTML elements
const qrCodeContainer = document.getElementById('qrcode-container');
const downloadBtn = document.getElementById('download-link');
const editUrlInput = document.getElementById('edit-url');
const copyBtn = document.getElementById('copy-button');

// Run when the page content is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Get information from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const shortCode = params.get('code');
    const editToken = params.get('token');

    // Check if necessary information is in the URL
    if (shortCode && editToken) {
        // Generate and display QR code
        const redirectUrl = `${window.location.origin}/${shortCode}`;
        new QRCode(qrCodeContainer, {
            text: redirectUrl,
            width: 200,
            height: 200,
        });

        // Handle download button
        // A slight delay to ensure the canvas is rendered
        setTimeout(() => {
            const canvas = qrCodeContainer.querySelector('canvas');
            if (canvas) {
                const dataUrl = canvas.toDataURL('image/png');
                downloadBtn.href = dataUrl;
                downloadBtn.download = `dynqr-${shortCode}.png`;
            }
        }, 100); // 100ms delay

        // Display the edit URL
        const editUrl = `${window.location.origin}/edit.html?token=${editToken}`;
        editUrlInput.value = editUrl;

    } else {
        // If information is missing, show an error
        document.querySelector('main').innerHTML = '<p class="text-red-500 text-center">Could not display the result. Please try creating a QR code again.</p>';
    }
});

// Handle copy button
copyBtn.addEventListener('click', () => {
    editUrlInput.select();
    document.execCommand('copy');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
});

