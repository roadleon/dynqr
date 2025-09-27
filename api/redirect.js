// Supabaseのクライアントライブラリをインポート (サーバーサイド用の'require'を使用)
const { createClient } = require('@supabase/supabase-js');

// Vercelの環境変数からSupabaseの情報を取得
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Supabaseクライアントを初期化
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Vercelサーバーレス関数のエントリーポイント
module.exports = async (req, res) => {
    // URLのクエリパラメータから'code'を取得 (例: /?code=abcdef -> abcdef)
    const shortCode = req.query.code;

    if (!shortCode) {
        // short_codeがなければ、サイトのルート（トップページ）へリダイレクト
        // VercelのデプロイURLを取得
        const deployUrl = req.headers['x-forwarded-proto'] + '://' + req.headers['host'];
        return res.redirect(302, deployUrl);
    }

    try {
        // Supabaseの'links'テーブルからshort_codeに一致するデータを検索
        const { data, error } = await supabase
            .from('links')
            .select('destination_url')
            .eq('short_code', shortCode)
            .single(); // 一致するデータは1件のはず

        if (error || !data) {
            // データが見つからないか、エラーが発生した場合
            console.error('Redirect error for code:', shortCode, error);
            // 404 Not Foundページを表示
            return res.status(404).send('<html><body><h1>404 - Link Not Found</h1><p>The requested QR code link does not exist or has been moved.</p></body></html>');
        }

        // 宛先URLへリダイレクト (307: Temporary Redirect)
        res.redirect(307, data.destination_url);

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).send('<html><body><h1>500 - Internal Server Error</h1></body></html>');
    }
};

