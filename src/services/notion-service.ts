import { Client } from '@notionhq/client';
import type { NotionPageId } from '../types';

// Notion APIクライアントと環境変数を保持する変数
let notion: Client;
let STUDENT_DATABASE_ID: string;
let EVENT_DATABASE_ID: string;

/**
 * Notion APIクライアントを初期化する関数
 *
 * @param apiKey Notion API Key
 * @param studentDbId 生徒データベースID
 * @param eventDbId イベントデータベースID
 */
export function initNotionClient(apiKey: string, studentDbId: string, eventDbId: string): void {
  notion = new Client({ auth: apiKey });
  STUDENT_DATABASE_ID = studentDbId;
  EVENT_DATABASE_ID = eventDbId;
}

/**
 * 生徒情報を取得する関数
 *
 * @param studentIds 生徒IDのリスト
 * @returns NotionページIDのリスト
 */
export async function getStudents(studentIds: string[]): Promise<NotionPageId[]> {
  if (!STUDENT_DATABASE_ID) {
    throw new Error('STUDENT_DATABASE_ID環境変数が設定されていません');
  }

  try {
    // NotionのAPIフィルター制限（最大100項目）に対応するため、IDをバッチ処理
    const BATCH_SIZE = 90; // 余裕を持って90に設定
    const batches = [];

    // 生徒IDを90個ずつのバッチに分割
    for (let i = 0; i < studentIds.length; i += BATCH_SIZE) {
      batches.push(studentIds.slice(i, i + BATCH_SIZE));
    }

    // 各バッチを順次処理し、結果を集約
    let allResults: NotionPageId[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      try {
        const response = await notion.databases.query({
          database_id: STUDENT_DATABASE_ID,
          filter: {
            or: batch.map(id => ({
              property: 'LステップID',
              rich_text: {
                equals: id
              }
            }))
          }
        });

        // 結果のIDのみを抽出
        const pageIds = response.results.map(page => page.id);
        allResults = [...allResults, ...pageIds];
      } catch (batchError) {
        console.error(`バッチ${i + 1}の処理中にエラーが発生しました:`, batchError);
        throw batchError;
      }
    }

    // 見つからなかった生徒IDがあれば報告
    if (allResults.length < studentIds.length) {
      console.warn(`警告: ${studentIds.length - allResults.length}件の生徒IDが見つかりませんでした`);
    }

    return allResults;
  } catch (error) {
    console.error('生徒情報取得エラー:', error);
    throw error;
  }
}

/**
 * イベントを登録する関数
 *
 * @param eventName イベント名
 * @param eventDate 開催日
 * @param students 参加生徒のNotionページIDリスト
 * @returns 作成されたイベントのID
 */
export async function createEvent(eventName: string, eventDate: string, students: NotionPageId[]): Promise<{id: string}> {
  if (!EVENT_DATABASE_ID) {
    throw new Error('EVENT_DATABASE_ID環境変数が設定されていません');
  }

  try {
    // イベントページを作成
    const response = await notion.pages.create({
      parent: {
        database_id: EVENT_DATABASE_ID,
      },
      properties: {
        '名前': {
          title: [
            {
              text: {
                content: eventName
              }
            }
          ]
        },
        '開催日': {
          date: {
            start: eventDate
          }
        },
        '参加者': {
          relation: students.map(studentId => ({
            id: studentId
          }))
        }
      }
    });

    return {
      id: response.id
    };
  } catch (error) {
    console.error('イベント登録エラー:', error);
    throw error;
  }
}

/**
 * 既存のイベントを更新する関数
 *
 * @param pageId イベントページのID
 * @param students 参加生徒のNotionページIDリスト
 * @returns 更新されたイベントのID
 */
export async function updateEventParticipants(pageId: string, students: NotionPageId[]): Promise<{id: string}> {
  try {
    if (!pageId) {
      throw new Error('有効なページIDが指定されていません');
    }

    // イベントページを更新
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        '参加者': {
          relation: students.map(studentId => ({
            id: studentId
          }))
        }
      }
    });

    return {
      id: response.id
    };
  } catch (error) {
    console.error('イベント更新エラー:', error);
    throw error;
  }
}
