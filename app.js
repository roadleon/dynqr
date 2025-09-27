// Supabase client libraryをインポート
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';

// --- 重要：あなたのSupabase URLとAnon Keyに置き換えてください ---
const SUPABASE_URL = 'https://phvfayqklknxrvyfjzru.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodmZheXFrbGtueHJ2eWZqenJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNTc1NzUsImV4cCI6MjA3MzgzMzU3NX0.iMb2goMgHYzAPjePlawuIe0ovoJ_WHB89fzkPy_U0Ds';
// ----------------------------------------------------

// Supabaseクライアントを初期化
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// HTML要素を取得
const form = document.getElementById('qr-form');
const urlInput = document.getElementById('url-input');
const loader = document.getElementById('loader');
const resultSection = document.getElementById('result');
const qrCodeContainer = document.getElementById('qrcode');
const downloadBtn = document.getElementById('download-btn');
const editUrlInput = document.getElementById('edit-url');
const copyBtn = document.getElementById('copy-btn');
const qrRedirectUrl = document.getElementById('qr-redirect-url');

// フォームの送信イベントを処理
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultSection.classList.add('hidden');
    qrCodeContainer.innerHTML = '';
    loader.classList.remove('hidden');

    const url = urlInput.value.trim();
    if (!url) {
        alert('Please enter a destination URL.');
        loader.classList.add('hidden');
        return;
    }

    // ★★★ エラー表示機能 ★★★
    // 以前のエラーメッセージがあれば削除
    const existingError = document.getElementById('insert-error');
    if (existingError) {
        existingError.remove();
    }

    try {
        // 短いコードと編集トークンを生成
        const shortCode = Math.random().toString(36).substring(2, 8);
        const editToken = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);

        // Supabaseにデータを挿入
        const { data, error } = await supabase
            .from('links')
            .insert([
                {
                    destination_url: url,
                    short_code: shortCode,
                    edit_token: editToken,
                },
            ])
            .select(); // RLSのエラーを取得するために.select()が必要

        // 挿入時にエラーがあれば、それをスローしてcatchブロックで処理
        if (error) {
            throw error;
        }
        
        // データが返ってこない場合もエラーとして扱う (RLSが原因の場合など)
        if (!data || data.length === 0) {
            throw new Error('Data was not saved to the database. This might be due to Row Level Security policies.');
        }

        // QRコードを生成して表示
        const redirectUrl = `${window.location.origin}/${shortCode}`;
        new QRCode(qrCodeContainer, {
            text: redirectUrl,
            width: 200,
            height: 200,
        });

        // 結果を表示
        qrRedirectUrl.textContent = redirectUrl;
        downloadBtn.onclick = () => {
            const canvas = qrCodeContainer.querySelector('canvas');
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `dynqr-${shortCode}.png`;
            link.href = dataUrl;
            link.click();
        };

        const editUrl = `${window.location.origin}/edit.html?token=${editToken}`;
        editUrlInput.value = editUrl;
        resultSection.classList.remove('hidden');

    } catch (err) {
        console.error('Error during QR code generation:', err);
        // ★★★ エラーを画面に表示 ★★★
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

// コピーボタンの処理
copyBtn.addEventListener('click', () => {
    editUrlInput.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = 'Copy';
    }, 2000);
});

