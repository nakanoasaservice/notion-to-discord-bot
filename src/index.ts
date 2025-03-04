import { Hono } from 'hono';
import type { Env } from './types';
import { initNotionClient } from './services/notion-service';
import { processJsonRequest, processFormRequest } from './controllers/webhook-controller';

// アプリケーションの初期化
const app = new Hono<{ Bindings: Env }>();

// GETリクエストのWebhookエンドポイント
app.get('/webhook', (c) => {
  return c.json({
    success: true,
    message: 'Webhook GETエンドポイントは動作中です。データ送信にはPOSTリクエストを使用してください。'
  });
});

// POSTリクエストのWebhookエンドポイント
app.post('/webhook', async (c) => {
  try {
    // 環境変数の設定とNotionクライアントの初期化
    const env = c.env;
    initNotionClient(env.NOTION_API_KEY, env.STUDENT_DATABASE_ID, env.EVENT_DATABASE_ID);

    // Content-Typeに基づいてリクエストボディを処理
    const contentType = c.req.header('content-type') || '';

    if (contentType.includes('application/json')) {
      // JSONデータの処理
      const jsonData = await c.req.json();
      return await processJsonRequest(c, jsonData);
    }

    // サポートされていないContent-Type
    return c.json({
      success: false,
      error: `サポートされていないContent-Type: ${contentType}. 'application/json'を使用してください`
    }, 415);
  } catch (error) {
    console.error('Webhook処理エラー:', error);
    return c.json({
      success: false,
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }, 500);
  }
});

// 基本的なヘルスチェックエンドポイント
app.get('/', (c) => c.json({
  status: 'ok',
  message: 'Notion Webhook Receiver is running',
  endpoints: {
    webhook: {
      url: '/webhook',
      method: 'POST',
      description: 'Notionフォームからのデータを受け取るエンドポイント'
    }
  }
}));

// Cloudflare Workersのエクスポート
export default app;
