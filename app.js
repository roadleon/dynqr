// SupabaseとQRコードのライブラリをインポートする
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode/+esm';

// SupabaseプロジェクトのURLとanonキー（公開しても安全なキー）
const SUPABASE_URL = 'https://phvfayqklknxrvyfjzru.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodmZheXFrbGtueHJ2eWZqenJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNTc1NzUsImV4cCI6MjA3MzgzMzU3NX0.iMb2goMgHYzAPjePlawuIe0ovoJ_WHB89fzkPy_U0Ds';

// Supabaseクライアントを初期化
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// HTMLから必要な要素を取得
const qrForm = document.getElementById('qr-form');
const destinationUrlInput = document.getElementById('destination-url');
const loader = document.getElementById('loader');
const generatorSection = document.getElementById('generator-section');
const resultSection = document.getElementById('result-section');
const qrCanvas = document.getElementById('qr-canvas');
const downloadLink = document.getElementById('download-link');
const editUrlInput = document.getElementById('edit-url');
const copyButton = document.getElementById('copy-button');
const copyFeedback = document.getElementById('copy-feedback');

/**
 * ランダムな文字列を生成する関数 (URLセーフ)
 * @param {number} length - 生成する文字列の長さ
 * @returns {string} ランダムな文字列
 */
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * フォームが送信されたときの処理
 * @param {Event} e - イベントオブジェクト
 */
async function handleFormSubmit(e) {
    e.preventDefault(); // フォームのデフォルトの送信動作をキャンセル

    // UIを「処理中」の状態にする
    loader.classList.remove('hidden');
    resultSection.classList.add('hidden');

    const destinationUrl = destinationUrlInput.value;

    // 6文字の短いコードと、32文字の編集用トークンを生成
    const shortCode = generateRandomString(6);
    const editToken = generateRandomString(32);

    try {
        // Supabaseの'links'テーブルにデータを挿入
        const { data, error } = await supabase
            .from('links')
            .insert([
                {
                    short_code: shortCode,
                    destination_url: destinationUrl,
                    edit_token: editToken
                }
            ])
            .select()
            .single(); // 挿入したデータを返してもらう

        if (error) {
            // もしshort_codeが重複していたらリトライするなどの処理も考えられるが、まずはエラーを投げる
            throw error;
        }

        // --- 成功した場合の処理 ---

        // QRコードに含めるリダイレクト用URL（あとでVercelで設定する）
        const redirectUrl = `https://dynqr.vercel.app/${shortCode}`;
        // 編集ページのURL（あとで作成する）
        const editUrl = `${window.location.origin}/edit.html?token=${editToken}`;

        // QRコードをcanvasに描画
        await QRCode.toCanvas(qrCanvas, redirectUrl, {
            width: 256,
            margin: 2,
            errorCorrectionLevel: 'H'
        });

        // ダウンロードリンクを設定
        downloadLink.href = qrCanvas.toDataURL('image/png');
        downloadLink.download = `dynqr-${shortCode}.png`;

        // 編集用URLを表示
        editUrlInput.value = editUrl;

        // UIを結果表示の状態にする
        generatorSection.classList.add('hidden'); // フォームを隠す
        resultSection.classList.remove('hidden'); // 結果を表示

    } catch (err) {
        console.error('エラー:', err);
        alert('エラーが発生しました。入力したURLが正しいか確認し、もう一度お試しください。');
    } finally {
        // 処理が成功しても失敗しても、ローダーは非表示にする
        loader.classList.add('hidden');
    }
}

/**
 * コピーボタンがクリックされたときの処理
 */
function copyEditUrl() {
    editUrlInput.select();
    document.execCommand('copy');
    copyFeedback.classList.remove('hidden');
    setTimeout(() => {
        copyFeedback.classList.add('hidden');
    }, 2000); // 2秒後に「コピーしました」を消す
}


// イベントリスナーを設定
qrForm.addEventListener('submit', handleFormSubmit);
copyButton.addEventListener('click', copyEditUrl);
