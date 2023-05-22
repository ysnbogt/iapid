import { readFileSync, readdirSync } from 'fs';
import os from 'os';
import { join, basename } from 'path';

import highlight from 'cli-highlight';
import { prompt } from 'enquirer';

import type { Argv } from 'yargs';

const apiDir = join(os.homedir(), '.api');
const templatesDir = join(apiDir, 'templates');
const projectsFilePath = join(apiDir, 'projects.json');

async function templateProcess() {
  const templateFiles = readdirSync(templatesDir).filter(file =>
    file.endsWith('.tpl')
  );

  const templateName: { templateName: string } = await prompt({
    type: 'select',
    name: 'templateName',
    message: 'Choose template:',
    choices: templateFiles.map(file => basename(file, '.tpl')),
  });

  const template = readFileSync(
    join(templatesDir, `${templateName.templateName}.tpl`),
    'utf8'
  );

  console.log(highlight(template, { language: 'markdown' }));
}

async function projectProcess() {
  const projects = JSON.parse(readFileSync(projectsFilePath, 'utf8'));
  if (Object.keys(projects).length === 0) {
    console.log('No projects');
    return;
  }

  const projectName: { projectName: string } = await prompt({
    type: 'select',
    name: 'projectName',
    message: 'Choose project:',
    choices: Object.keys(projects),
  });

  console.log(
    highlight(JSON.stringify(projects[projectName.projectName], null, 2), {
      language: 'json',
    })
  );
}

export function showSubCommand(yargs: Argv) {
  return yargs
    .command('template', 'Create a new template', templateProcess)
    .command('project', 'Create a new project', projectProcess)
    .command('*', '', projectProcess)
    .demandCommand(1);
}
