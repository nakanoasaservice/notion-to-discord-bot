/**
 * CSVを解析して生徒IDのリストを取得する関数
 *
 * @param url CSVファイルのURL
 * @returns 抽出した生徒IDのリスト
 */
export async function parseCSV(url: string): Promise<string[]> {
  try {
    // CSVファイルを取得
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CSVファイルの取得に失敗しました: ${response.status} ${response.statusText}`);
    }

    const csvContent = await response.text();

    // CSVの行に分割
    const lines = csvContent.split('\n');

    // 1行目は無視し、2行目をヘッダー、3行目以降をデータとして扱う
    if (lines.length < 3) {
      throw new Error('CSVファイルの形式が不正です：ヘッダーとデータが不足しています');
    }

    // 2行目をヘッダー行として処理
    const headers = lines[1].split(',');

    // IDカラムのインデックスを検索
    const idColumnIndex = headers.findIndex(column =>
      column.trim().toLowerCase() === 'id' ||
      column.trim().toLowerCase() === 'studentid' ||
      column.trim().toLowerCase() === 'student id'
    );

    if (idColumnIndex === -1) {
      throw new Error('CSVファイルにID列が見つかりません');
    }

    // 3行目以降からIDを抽出
    const studentIds: string[] = [];
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const columns = line.split(',');
        if (columns.length > idColumnIndex) {
          const id = columns[idColumnIndex].trim();
          if (id) {
            studentIds.push(id);
          }
        }
      }
    }

    return studentIds;
  } catch (error) {
    console.error('CSV解析エラー:', error);
    throw error;
  }
}

/**
 * CSVファイルからIDを抽出する (ファイルオブジェクト版)
 *
 * @param file CSVファイルオブジェクト
 * @returns 抽出した生徒IDのリスト
 */
export async function parseCSVFile(file: File): Promise<string[]> {
  try {
    const csvContent = await file.text();

    // CSVの行に分割
    const lines = csvContent.split('\n');

    // 1行目は無視し、2行目をヘッダー、3行目以降をデータとして扱う
    if (lines.length < 3) {
      throw new Error('CSVファイルの形式が不正です：ヘッダーとデータが不足しています');
    }

    // 2行目をヘッダー行として処理
    const headers = lines[1].split(',');

    // IDカラムのインデックスを検索
    const idColumnIndex = headers.findIndex(column =>
      column.trim().toLowerCase() === 'id' ||
      column.trim().toLowerCase() === 'studentid' ||
      column.trim().toLowerCase() === 'student id'
    );

    if (idColumnIndex === -1) {
      throw new Error('CSVファイルにID列が見つかりません');
    }

    // 3行目以降からIDを抽出
    const studentIds: string[] = [];
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const columns = line.split(',');
        if (columns.length > idColumnIndex) {
          const id = columns[idColumnIndex].trim();
          if (id) {
            studentIds.push(id);
          }
        }
      }
    }

    return studentIds;
  } catch (error) {
    console.error('CSV解析エラー:', error);
    throw error;
  }
}
