// Supabaseのクライアントライブラリをインポート
const { createClient } = require('@supabase/supabase-js');

// Vercelの環境変数からSupabaseの情報を取得
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Supabaseクライアントを初期化
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Vercelサーバーレス関数のエントリーポイント
module.exports = async (req, res) => {
    // URLからshort_codeを取得 (例: /abcdef -> abcdef)
    // クエリパラメータ (?code=abcdef) もフォールバックとして対応
    const shortCode = req.query.code;

    if (!shortCode) {
        // short_codeがなければトップページへリダイレクト
        return res.redirect(301, '/');
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
            console.error('Redirect error:', error);
            // 404 Not Foundページを表示するのが親切だが、まずはトップへ
            return res.status(404).send('Link not found or expired.');
        }

        // 宛先URLへリダイレクト
        // 307は一時的なリダイレクト。恒久的な場合は301
        res.redirect(307, data.destination_url);

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).send('An internal server error occurred.');
    }
};
