import type { Context } from 'hono';
import { parseCSV, parseCSVFile } from '../services/csv-service';
import { getStudents, createEvent } from '../services/notion-service';

/**
 * Notionからのフォームデータインターフェイス
 */
interface NotionFormData {
  data?: {
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
        return c.json({
          success: false,
          error: 'イベント名が指定されていません'
        }, 400);
      }

      if (!eventDate) {
        return c.json({
          success: false,
          error: '開催日が指定されていません'
        }, 400);
      }

      if (!csvFileUrl) {
        return c.json({
          success: false,
          error: 'CSVファイルが見つかりません'
        }, 400);
      }

      // CSVから生徒IDを抽出
      const studentIds = await parseCSV(csvFileUrl);

      if (studentIds.length === 0) {
        return c.json({
          success: false,
          error: 'CSVファイルに有効な生徒IDが含まれていません'
        }, 400);
      }

      // 生徒情報を取得
      const students = await getStudents(studentIds);

      if (students.length === 0) {
        return c.json({
          success: false,
          error: '指定されたIDに一致する生徒が見つかりませんでした'
        }, 404);
      }

      // イベントを登録
      const event = await createEvent(eventName, eventDate, students);

      return c.json({
        success: true,
        message: 'イベントを登録しました',
        data: {
          eventName,
          eventDate,
          studentCount: students.length,
          eventId: event.id
        }
      });
    }

    return c.json({
      success: false,
      error: 'Notionフォームのデータ形式が不正です'
    }, 400);
  } catch (error) {
    console.error('Notionデータ処理エラー:', error);
    return c.json({
      success: false,
      error: `データ処理中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }, 500);
  }
}

/**
 * フォームデータからイベント情報を処理する関数
 *
 * @param c Honoコンテキスト
 * @param formData リクエストのフォームデータ
 * @returns レスポンス
 */
export async function processFormRequest(c: Context, formData: FormData) {
  try {
    // フォームからのデータを処理
    // イベント名の取得
    const eventName = formData.get('名前')?.toString() || '';

    // 開催日の取得
    const eventDate = formData.get('開催日')?.toString() || '';

    // CSVファイルの取得
    const csvFile = formData.get('ファイル&メディア') as File | null;

    // 必須項目の検証
    if (!eventName) {
      return c.json({
        success: false,
        error: 'イベント名が指定されていません'
      }, 400);
    }

    if (!eventDate) {
      return c.json({
        success: false,
        error: '開催日が指定されていません'
      }, 400);
    }

    if (!csvFile) {
      return c.json({
        success: false,
        error: 'CSVファイルが指定されていません'
      }, 400);
    }

    // CSVからIDを抽出
    const studentIds = await parseCSVFile(csvFile);

    if (studentIds.length === 0) {
      return c.json({
        success: false,
        error: 'CSVファイルに有効な生徒IDが含まれていません'
      }, 400);
    }

    // 生徒情報を取得
    const students = await getStudents(studentIds);

    if (students.length === 0) {
      return c.json({
        success: false,
        error: '指定されたIDに一致する生徒が見つかりませんでした'
      }, 404);
    }

    // イベントを登録
    const event = await createEvent(eventName, eventDate, students);

    return c.json({
      success: true,
      message: 'イベントを登録しました',
      data: {
        eventName,
        eventDate,
        studentCount: students.length,
        eventId: event.id
      }
    });
  } catch (error) {
    console.error('フォームデータ処理エラー:', error);
    return c.json({
      success: false,
      error: `データ処理中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }, 500);
  }
}
