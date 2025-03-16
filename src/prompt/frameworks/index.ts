import angularStrategy from './angular.md?raw';
import aspnetCoreStrategy from './aspnet-core.md?raw';
import djangoStrategy from './django.md?raw';
import expressStrategy from './express.md?raw';
import fastapiStrategy from './fastapi.md?raw';
import flaskStrategy from './flask.md?raw';
import laravelStrategy from './laravel.md?raw';
import nestjsStrategy from './nestjs.md?raw';
import nextjsStrategy from './nextjs.md?raw';
import railsStrategy from './rails.md?raw';
import reactStrategy from './react.md?raw';
import springBootStrategy from './spring-boot.md?raw';
import svelteStrategy from './svelte.md?raw';
import vueStrategy from './vue.md?raw';

// 框架策略映射
export const frameworkStrategies: Record<string, string> = {
  'angular': angularStrategy,
  'aspnet-core': aspnetCoreStrategy,
  'asp.net core': aspnetCoreStrategy,
  'django': djangoStrategy,
  'express': expressStrategy,
  'fastapi': fastapiStrategy,
  'flask': flaskStrategy,
  'laravel': laravelStrategy,
  'nestjs': nestjsStrategy,
  'next.js': nextjsStrategy,
  'nextjs': nextjsStrategy,
  'rails': railsStrategy,
  'ruby on rails': railsStrategy,
  'react': reactStrategy,
  'spring boot': springBootStrategy,
  'springboot': springBootStrategy,
  'svelte': svelteStrategy,
  'sveltekit': svelteStrategy,
  'vue': vueStrategy,
  'vue.js': vueStrategy,
};

/**
 * 从 Markdown 内容中提取框架特定技巧
 * @param markdownContent Markdown 内容
 * @returns 提取的框架特定技巧
 */
export function extractTechniquesFromMarkdown(markdownContent: string): string {
  // 查找 "## 框架特定技巧" 部分
  const techniquesMatch = markdownContent.match(/## 框架特定技巧\s+([\s\S]+?)(?=##|$)/);
  
  if (techniquesMatch) {
    return markdownContent.split('## 框架特定技巧')[1].trim();
  }
  
  return '';
}

/**
 * 获取指定框架的策略
 * @param framework 框架名称
 * @returns 框架特定策略
 */
export function getFrameworkStrategy(framework: string): string {
  // 规范化框架名称（转为小写）
  const normalizedFramework = framework.toLowerCase();
  
  // 查找匹配的框架策略
  const strategy = frameworkStrategies[normalizedFramework];
  
  if (strategy) {
    return extractTechniquesFromMarkdown(strategy);
  }
  
  // 如果没有找到匹配的框架策略，返回空字符串
  return '';
} 