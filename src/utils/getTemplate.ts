import { readFileSync } from 'fs';
import os from 'os';
import { join } from 'path';
import { MarkdownType } from '../types';

const apiDir = join(os.homedir(), '.api');
const templatesDir = join(apiDir, 'templates');

export function getTemplate(markdownType: MarkdownType): string {
  return readFileSync(join(templatesDir, `${markdownType}.tpl`), 'utf8');
}
