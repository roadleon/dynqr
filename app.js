// Supabase client libraryをインポート
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';

const SUPABASE_URL = 'https://phvfayqklknxrvyfjzru.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodmZheXFrbGtueHJ2eWZqenJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNTc1NzUsImV4cCI6MjA3MzgzMzU3NX0.iMb2goMgHYzAPjePlawuIe0ovoJ_WHB89fzkPy_U0Ds';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// HTML要素を正しいIDで取得
const form = document.getElementById('qr-form');
const urlInput = document.getElementById('destination-url'); // 修正
const loader = document.getElementById('loader');
const resultSection = document.getElementById('result-section'); // 修正
const qrCodeContainer = document.getElementById('qrcode-container'); // 修正
const downloadBtn = document.getElementById('download-link'); // 修正
const editUrlInput = document.getElementById('edit-url');
const copyBtn = document.getElementById('copy-button'); // 修正

// QRコード生成ライブラリを読み込むためのscriptタグを動的に追加
const qrScript = document.createElement('script');
qrScript.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
document.head.appendChild(qrScript);


qrScript.onload = () => {
    // フォームの送信イベントを処理
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        resultSection.classList.add('hidden');
        qrCodeContainer.innerHTML = '';
        loader.classList.remove('hidden');

        const url = urlInput.value.trim();
        if (!url) {
            // alertの代わりにカスタムUIを将来的に検討
            console.warn('Please enter a destination URL.');
            loader.classList.add('hidden');
            return;
        }

        const existingError = document.getElementById('insert-error');
        if (existingError) {
            existingError.remove();
        }

        try {
            const shortCode = Math.random().toString(36).substring(2, 8);
            const editToken = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);

            const { data, error } = await supabase
                .from('links')
                .insert([{
                    destination_url: url,
                    short_code: shortCode,
                    edit_token: editToken,
                }, ])
                .select();

            if (error) throw error;
            if (!data || data.length === 0) throw new Error('Data was not saved. Check RLS policies.');
            
            const redirectUrl = `${window.location.origin}/${shortCode}`;

            // qrcode.jsライブラリを使用
            new QRCode(qrCodeContainer, {
                text: redirectUrl,
                width: 200,
                height: 200,
            });

            downloadBtn.onclick = () => {
                const canvas = qrCodeContainer.querySelector('canvas');
                if (canvas) {
                    const dataUrl = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.download = `dynqr-${shortCode}.png`;
                    link.href = dataUrl;
                    link.click();
                }
            };

            const editUrl = `${window.location.origin}/edit.html?token=${editToken}`;
            editUrlInput.value = editUrl;
            resultSection.classList.remove('hidden');

        } catch (err) {
            console.error('Error during QR code generation:', err);
            const errorElement = document.createElement('p');
            errorElement.id = 'insert-error';
            errorElement.textContent = `ERROR: ${err.message}`;
            errorElement.style.color = 'red';
            errorElement.style.fontWeight = 'bold';
            errorElement.style.marginTop = '1rem';
            form.insertAdjacentElement('afterend', errorElement);
        } finally {
            loader.classList.add('hidden');
        }
    });
};

// コピーボタンの処理
copyBtn.addEventListener('click', () => {
    editUrlInput.select();
    document.execCommand('copy');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
});

