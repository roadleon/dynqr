// Supabaseのクライアントライブラリをインポート
const { createClient } = require('@supabase/supabase-js');

// Vercelサーバーレス関数のエントリーポイント
module.exports = async (req, res) => {
    // Vercelの環境変数を取得
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    // --- 診断機能 ---
    // 環境変数が設定されているかチェック
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Environment variables SUPABASE_URL or SUPABASE_ANON_KEY are not set.');
        // ユーザーには具体的なエラー内容を見せないように、一般的なサーバーエラーを返す
        return res.status(500).send('<html><body><h1>500 - Server Configuration Error</h1><p>The server is not configured correctly. Please contact the administrator.</p></body></html>');
    }

    // クエリパラメータから'code'を取得
    const shortCode = req.query.code;

    if (!shortCode) {
        // codeがなければトップページへ
        const deployUrl = `https://${req.headers.host}`;
        return res.redirect(302, deployUrl);
    }

    try {
        // このリクエストのためだけにSupabaseクライアントを初期化
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Supabaseの'links'テーブルからデータを検索
        const { data, error } = await supabase
            .from('links')
            .select('destination_url')
            .eq('short_code', shortCode)
            .single();

        if (error || !data) {
            console.error('Redirect error for code:', shortCode, error);
            return res.status(404).send('<html><body><h1>404 - Link Not Found</h1></body></html>');
        }

        // 宛先URLへリダイレクト
        res.redirect(307, data.destination_url);

    } catch (err) {
        console.error('Server execution error:', err);
        return res.status(500).send('<html><body><h1>500 - Internal Server Error</h1></body></html>');
    }
};

