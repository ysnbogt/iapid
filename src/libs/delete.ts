import { prompt } from 'enquirer';
import type { Argv } from 'yargs';
import os from 'os';
import { join, basename } from 'path';
import { readFileSync, readdirSync, unlink, writeFileSync } from 'fs';

const apiDir = join(os.homedir(), '.api');
const templatesDir = join(apiDir, 'templates');
const projectsFilePath = join(apiDir, 'projects.json');

async function templateProcess() {
  const templateFiles = readdirSync(templatesDir).filter(file =>
    file.endsWith('.tpl')
  );
  const templates = templateFiles.map(file => basename(file, '.tpl'));

  const templateName: { templateName: string } = await prompt({
    type: 'select',
    name: 'templateName',
    message: 'Choose template:',
    choices: templates,
  });

  unlink(join(templatesDir, `${templateName.templateName}.tpl`), err => {
    if (err) throw err;
    console.log('successfully deleted');
  });
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

  delete projects[projectName.projectName];

  writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2));
  console.log(`Project ${projectName.projectName} deleted`);
}

export function deleteSubCommand(yargs: Argv) {
  return yargs
    .command('template', 'Create a new template', templateProcess)
    .command('project', 'Create a new project', projectProcess)
    .command('*', '', projectProcess)
    .demandCommand(1);
}
