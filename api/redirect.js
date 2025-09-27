const { createClient } = require('@supabase/supabase-js');

// Vercelの環境変数からSupabaseの情報を取得
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// APIハンドラ関数
module.exports = async (req, res) => {
  // 環境変数が設定されていない場合は、サーバーエラーを返す
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Server configuration error: Supabase URL or Service Key is missing.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }
  
  // ★★★ マスターキー(service_role)を使ってSupabaseクライアントを初期化 ★★★
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // URLのクエリパラメータから短いコードを取得 (例: /?code=abcdef)
  const { code } = req.query;

  // 短いコードが提供されていない場合は、エラーを返す
  if (!code) {
    return res.status(400).json({ error: 'Short code is required.' });
  }

  try {
    // Supabaseの'links'テーブルから、一致する短いコードを持つデータを検索
    const { data, error } = await supabase
      .from('links')
      .select('destination_url')
      .eq('short_code', code)
      .single(); // 結果が1行であることを期待する

    // データベース検索でエラーが発生した場合
    if (error) {
      // データが見つからなかった場合(PGRST116)は、404エラーを返す
      if (error.code === 'PGRST116') {
        return res.status(404).send('The requested QR code link was not found.');
      }
      // その他のデータベースエラー
      throw error;
    }

    // データが見つかった場合は、指定された宛先URLにリダイレクトする
    if (data) {
      res.redirect(307, data.destination_url); // 307は一時的なリダイレクト
    } else {
      // データが見つからなかった場合の念のためのフォールバック
      res.status(404).send('The requested QR code link was not found.');
    }
  } catch (error) {
    console.error('Redirect error:', error);
    // 予期せぬエラーが発生した場合は、500サーバーエラーを返す
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

