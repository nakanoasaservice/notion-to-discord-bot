import type { Context } from 'hono';
import { parseCSV } from '../services/csv-service';
import { getStudents, updateEventParticipants } from '../services/notion-service';

/**
 * Notionからのフォームデータインターフェイス
 */
interface NotionFormData {
  pageId?: string; // ページID（ボタンを押したイベントページのID）
  data?: {
    id?: string; // Notionオートメーションから送信されるページID
    properties?: {
      名前?: {
        title?: Array<{
          plain_text?: string;
        }>;
      };
      開催日?: {
        date?: {
          start?: string;
        };
      };
      'ファイル&メディア'?: {
        files?: Array<{
          file?: {
            url?: string;
          };
        }>;
      };
    };
  };
}

/**
 * JSONデータからイベント情報を処理する関数
 *
 * @param c Honoコンテキスト
 * @param jsonData リクエストボディのJSONデータ
 * @returns レスポンス
 */
export async function processJsonRequest(c: Context, jsonData: NotionFormData) {
  try {
    // ページIDの取得
    let pageId = jsonData.pageId;

    // pageIdが存在しない場合は、data.idをページIDとして使用する
    if (!pageId && jsonData.data?.id) {
      pageId = jsonData.data.id;
    }

    if (!pageId) {
      console.error('エラー: ページIDが見つかりません');
      return c.json({
        success: false,
        error: 'ページIDが指定されていません。Notionオートメーションの設定を確認してください。'
      }, 400);
    }

    // Notionフォームからのデータを処理
    const pageData = jsonData.data;
    if (pageData?.properties) {
      const properties = pageData.properties;

      // イベント名の取得
      let eventName = '';
      if (properties.名前?.title && properties.名前.title.length > 0) {
        eventName = properties.名前.title[0].plain_text || '';
      }

      // 開催日の取得
      let eventDate = '';
      if (properties.開催日?.date) {
        eventDate = properties.開催日.date.start || '';
      }

      // CSVファイルURLの取得
      let csvFileUrl = '';
      if (properties['ファイル&メディア']?.files &&
          properties['ファイル&メディア'].files.length > 0) {
        csvFileUrl = properties['ファイル&メディア'].files[0].file?.url || '';
      }

      // 必須項目の検証
      if (!eventName) {
        console.error('エラー: イベント名が指定されていません');
        return c.json({
          success: false,
          error: 'イベント名が指定されていません'
        }, 400);
      }

      if (!eventDate) {
        console.error('エラー: 開催日が指定されていません');
        return c.json({
          success: false,
          error: '開催日が指定されていません'
        }, 400);
      }

      if (!csvFileUrl) {
        console.error('エラー: CSVファイルが見つかりません');
        return c.json({
          success: false,
          error: 'CSVファイルが見つかりません'
        }, 400);
      }

      try {
        // CSVから生徒IDを抽出
        const studentIds = await parseCSV(csvFileUrl);

        if (studentIds.length === 0) {
          console.error('エラー: CSVファイルに有効な生徒IDが含まれていません');
          return c.json({
            success: false,
            error: 'CSVファイルに有効な生徒IDが含まれていません'
          }, 400);
        }

        // 生徒情報を取得
        const students = await getStudents(studentIds);

        if (students.length === 0) {
          console.error('エラー: 指定されたIDに一致する生徒が見つかりませんでした');
          return c.json({
            success: false,
            error: '指定されたIDに一致する生徒が見つかりませんでした'
          }, 404);
        }

        // 既存のイベントページを更新
        const event = await updateEventParticipants(pageId, students);

        return c.json({
          success: true,
          message: 'イベントの参加者を更新しました',
          data: {
            eventName,
            eventDate,
            studentCount: students.length,
            eventId: event.id
          }
        });
      } catch (innerError) {
        console.error('処理エラー:', innerError);
        throw innerError;
      }
    } else {
      console.error('エラー: Notionフォームのデータ形式が不正です');
      return c.json({
        success: false,
        error: 'Notionフォームのデータ形式が不正です'
      }, 400);
    }
  } catch (error) {
    console.error('Notionデータ処理エラー:', error);
    return c.json({
      success: false,
      error: `データ処理中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }, 500);
  }
}
