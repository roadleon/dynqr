const { createClient } = require('@supabase/supabase-js');

// Vercelの環境変数からSupabaseの情報を取得
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// APIハンドラー関数
module.exports = async (req, res) => {
    // 環境変数が設定されているかチェック（自己診断機能）
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Server configuration error: Missing Supabase credentials.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    // Supabaseクライアントをマスターキーで初期化
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // URLのクエリパラメータから短いコードを取得 (例: /api/redirect?code=abcdef)
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ error: 'Short code is required.' });
        }

        // Supabaseの'links'テーブルから一致するデータを検索
        const { data, error } = await supabase
            .from('links')
            .select('destination_url')
            .eq('short_code', code)
            .single(); // .single()は結果が1行であることを期待するメソッド

        // データが見つからなかった場合のエラーハンドリング
        if (error) {
            console.error('Supabase query error:', error);
            // .single()でデータが見つからない場合、Supabaseはエラーを返す
            return res.status(404).send('<html><body><h1>404 Not Found</h1><p>The requested QR code link does not exist or has been deleted.</p></body></html>');
        }

        // データが見つかった場合、宛先URLにリダイレクト
        if (data && data.destination_url) {
            return res.redirect(302, data.destination_url);
        } else {
             // 万が一データがnullだった場合のフォールバック
            return res.status(404).send('<html><body><h1>404 Not Found</h1><p>Destination URL not found for the given code.</p></body></html>');
        }

    } catch (err) {
        // その他の予期せぬエラー
        console.error('Unexpected error:', err);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};

