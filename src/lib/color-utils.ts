/**
 * 颜色工具函数
 * 用于计算对比度和颜色转换
 */

/**
 * 解析 oklch 颜色字符串
 * @param oklchStr - oklch(L C H) 格式的颜色字符串
 * @returns { l, c, h } 或 null
 */
export function parseOklch(oklchStr: string): { l: number; c: number; h: number } | null {
  const match = oklchStr.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!match) return null;
  
  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
  };
}

/**
 * 将 oklch 转换为 sRGB
 * 简化版本，用于对比度计算
 */
export function oklchToSrgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
  // 简化转换：使用亮度作为主要因素
  // 对于对比度计算，我们主要关心相对亮度
  // 这是一个近似值，足够用于 WCAG 对比度检查
  
  // 将 oklch 亮度 (0-1) 转换为 sRGB 亮度
  // oklch 的 L 值直接对应感知亮度
  const hRad = (h * Math.PI) / 180;
  
  // 简化的 oklch 到 sRGB 转换
  // 基于 oklch 的定义，L 是感知亮度
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  
  // 转换到线性 sRGB（简化版）
  let lr = l + 0.3963377774 * a + 0.2158037573 * b;
  let lg = l - 0.1055613458 * a - 0.0638541728 * b;
  let lb = l - 0.0894841775 * a - 1.2914855480 * b;
  
  // 立方根逆变换
  lr = lr * lr * lr;
  lg = lg * lg * lg;
  lb = lb * lb * lb;
  
  // 转换到 sRGB
  let r = 4.0767416621 * lr - 3.3077115913 * lg + 0.2309699292 * lb;
  let g = -1.2684380046 * lr + 2.6097574011 * lg - 0.3413193965 * lb;
  let bVal = -0.0041960863 * lr - 0.7034186147 * lg + 1.7076147010 * lb;
  
  // 钳制到 0-1 范围
  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  bVal = Math.max(0, Math.min(1, bVal));
  
  return { r, g, b: bVal };
}

/**
 * 计算相对亮度 (WCAG 2.1)
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * 计算两个颜色之间的对比度 (WCAG 2.1)
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 从 oklch 字符串计算相对亮度
 */
export function getOklchLuminance(oklchStr: string): number {
  const parsed = parseOklch(oklchStr);
  if (!parsed) return 0;
  
  const { r, g, b } = oklchToSrgb(parsed.l, parsed.c, parsed.h);
  return getRelativeLuminance(r, g, b);
}

/**
 * 计算两个 oklch 颜色之间的对比度
 */
export function getOklchContrastRatio(color1: string, color2: string): number {
  const l1 = getOklchLuminance(color1);
  const l2 = getOklchLuminance(color2);
  
  return getContrastRatio(l1, l2);
}

/**
 * 检查对比度是否符合 WCAG AA 标准 (4.5:1)
 */
export function meetsWcagAA(contrastRatio: number): boolean {
  return contrastRatio >= 4.5;
}

/**
 * 检查对比度是否符合 WCAG AAA 标准 (7:1)
 */
export function meetsWcagAAA(contrastRatio: number): boolean {
  return contrastRatio >= 7;
}
