import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabaseプロジェクトの情報
const SUPABASE_URL = 'https://phvfayqklknxrvyfjzru.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodmZheXFrbGtueHJ2eWZqenJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNTc1NzUsImV4cCI6MjA3MzgzMzU3NX0.iMb2goMgHYzAPjePlawuIe0ovoJ_WHB89fzkPy_U0Ds';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// HTML要素の取得
const loader = document.getElementById('loader');
const editForm = document.getElementById('edit-form');
const newDestinationUrlInput = document.getElementById('new-destination-url');
const shortCodeDisplay = document.getElementById('short-code-display');
const messageArea = document.getElementById('message-area');
const editSection = document.getElementById('edit-section');

// URLから編集トークンを取得
const urlParams = new URLSearchParams(window.location.search);
const editToken = urlParams.get('token');

/**
 * ページ読み込み時に現在の宛先URLを取得して表示する関数
 */
async function loadCurrentData() {
    if (!editToken) {
        showMessage('Invalid edit link. No token provided.', 'error');
        loader.classList.add('hidden');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('links')
            .select('destination_url, short_code')
            .eq('edit_token', editToken)
            .single();

        if (error || !data) {
            throw new Error('Link not found or token is invalid.');
        }

        newDestinationUrlInput.value = data.destination_url;
        shortCodeDisplay.textContent = data.short_code;

        // データ取得後にフォームを表示
        loader.classList.add('hidden');
        editForm.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        showMessage(err.message, 'error');
        loader.classList.add('hidden');
    }
}

/**
 * フォーム送信時にURLを更新する関数
 */
async function handleUpdate(e) {
    e.preventDefault();
    const newUrl = newDestinationUrlInput.value;

    showMessage('Updating...', 'info');

    try {
        const { data, error } = await supabase
            .from('links')
            .update({ destination_url: newUrl })
            .eq('edit_token', editToken);

        if (error) {
            throw error;
        }

        showMessage('Destination updated successfully!', 'success');

    } catch (err) {
        console.error(err);
        showMessage('Failed to update. Please try again.', 'error');
    }
}

/**
 * ユーザーにメッセージを表示する関数
 * @param {string} text - 表示するメッセージ
 * @param {'success'|'error'|'info'} type - メッセージの種類
 */
function showMessage(text, type) {
    messageArea.textContent = text;
    messageArea.className = 'mt-4 text-center'; // Reset classes
    if (type === 'success') {
        messageArea.classList.add('text-green-600');
    } else if (type === 'error') {
        messageArea.classList.add('text-red-600');
    } else {
        messageArea.classList.add('text-gray-600');
    }
}

// イベントリスナーを設定
editForm.addEventListener('submit', handleUpdate);

// ページが読み込まれたら実行
document.addEventListener('DOMContentLoaded', loadCurrentData);
