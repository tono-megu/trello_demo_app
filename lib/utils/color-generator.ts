// 文字列から一意の色を生成するユーティリティ関数

/**
 * 文字列をハッシュ値に変換
 */
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return Math.abs(hash);
}

/**
 * ハッシュ値からHSL色を生成
 */
function hashToHSL(hash: number): { h: number; s: number; l: number } {
  const hue = hash % 360;
  const saturation = 60 + (hash % 30); // 60-90%の範囲
  const lightness = 45 + (hash % 20);  // 45-65%の範囲
  return { h: hue, s: saturation, l: lightness };
}

/**
 * 文字列から色を生成（ボード用 - より鮮やかな色）
 */
export function generateBoardColor(boardName: string): {
  background: string;
  border: string;
  text: string;
} {
  const hash = stringToHash(boardName);
  const { h, s, l } = hashToHSL(hash);
  
  return {
    background: `hsl(${h}, ${s}%, ${Math.min(l + 35, 95)}%)`, // より明るい背景
    border: `hsl(${h}, ${s}%, ${l}%)`,
    text: `hsl(${h}, ${Math.min(s + 20, 100)}%, ${Math.max(l - 30, 20)}%)` // より濃いテキスト
  };
}

/**
 * 文字列から色を生成（リスト用 - より落ち着いた色）
 */
export function generateListColor(listName: string): {
  background: string;
  border: string;
  text: string;
} {
  const hash = stringToHash(listName);
  const { h, s, l } = hashToHSL(hash);
  
  return {
    background: `hsl(${h}, ${Math.max(s - 20, 20)}%, ${Math.min(l + 40, 95)}%)`, // 彩度を下げて明度を上げる
    border: `hsl(${h}, ${s}%, ${Math.max(l - 10, 20)}%)`,
    text: `hsl(${h}, ${Math.min(s + 10, 80)}%, ${Math.max(l - 25, 25)}%)`
  };
}

/**
 * タスクカード用の色を生成（ボード名ベース）
 */
export function generateTaskCardColor(boardName: string): {
  background: string;
  border: string;
  accent: string;
} {
  const hash = stringToHash(boardName);
  const { h, s, l } = hashToHSL(hash);
  
  return {
    background: `hsl(${h}, ${Math.max(s - 40, 10)}%, 97%)`, // 非常に薄い背景
    border: `hsl(${h}, ${Math.max(s - 20, 20)}%, ${Math.max(l + 10, 70)}%)`, // 薄いボーダー
    accent: `hsl(${h}, ${s}%, ${l}%)` // アクセントカラー
  };
}

/**
 * CSSスタイルオブジェクトを生成
 */
export function generateBoardBadgeStyle(boardName: string): React.CSSProperties {
  const colors = generateBoardColor(boardName);
  return {
    backgroundColor: colors.background,
    borderColor: colors.border,
    color: colors.text,
  };
}

export function generateListBadgeStyle(listName: string): React.CSSProperties {
  const colors = generateListColor(listName);
  return {
    backgroundColor: colors.background,
    borderColor: colors.border,
    color: colors.text,
  };
}

export function generateTaskCardStyle(boardName: string): React.CSSProperties {
  const colors = generateTaskCardColor(boardName);
  return {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderLeftWidth: '4px',
    borderLeftColor: colors.accent,
  };
}