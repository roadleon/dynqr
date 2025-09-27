// --- DEBUGGING VERSION ---
// This code does NOT redirect. It displays the environment variables it receives.

module.exports = async (req, res) => {
    // Vercelの環境変数からSupabaseの情報を取得
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // 念のためANONキーもチェック

    // デバッグ情報を表示するためのHTMLを生成
    const htmlResponse = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Server Debug Info</title>
            <style>
                body { font-family: monospace, sans-serif; padding: 20px; background-color: #f3f4f6; color: #111827; }
                .container { background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                h1 { color: #1f2937; }
                .key { font-weight: bold; }
                .value { color: #059669; /* Green */ }
                .missing { color: #dc2626; /* Red */ font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>サーバー環境変数チェック</h1>
                <p>このページは、サーバーがVercelから受け取った情報を表示しています。</p>
                <hr>
                <h3>SUPABASE_URL:</h3>
                <p class="${supabaseUrl ? 'value' : 'missing'}">${supabaseUrl || '見つかりません (NOT FOUND)'}</p>
                
                <h3>SUPABASE_ANON_KEY:</h3>
                <p class="${supabaseAnonKey ? 'value' : 'missing'}">${supabaseAnonKey ? '見つかりました (セキュリティのため値は非表示)' : '見つかりません (NOT FOUND)'}</p>
                
                <h3>SUPABASE_SERVICE_KEY:</h3>
                <p class="${supabaseServiceKey ? 'value' : 'missing'}">${supabaseServiceKey ? '見つかりました (セキュリティのため値は非表示)' : '見つかりません (NOT FOUND)'}</p>
            </div>
        </body>
        </html>
    `;

    // 生成したHTMLをレスポンスとして返す
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(htmlResponse);
};

