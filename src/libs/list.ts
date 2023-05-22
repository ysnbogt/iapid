import { readFileSync, readdirSync } from 'fs';
import os from 'os';
import { join, basename } from 'path';

import chalk from 'chalk';
import { prompt } from 'enquirer';

import { getEndpoint } from '../utils/getEndpoints';

import type { Argv } from 'yargs';

const apiDir = join(os.homedir(), '.api');
const templatesDir = join(apiDir, 'templates');
const projectsFilePath = join(apiDir, 'projects.json');

async function templateProcess() {
  const templateFiles = readdirSync(templatesDir).filter(file =>
    file.endsWith('.tpl')
  );
  const templates = templateFiles.map(file => basename(file, '.tpl'));

  templates.forEach(template => {
    console.log(`- ${template}`);
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

  const project = projects[projectName.projectName];
  const endpoints = getEndpoint(project);
  endpoints.forEach(endpoint => {
    console.log(`- ${chalk.blue(endpoint)}`);
  });
}

export function listSubCommand(yargs: Argv) {
  return yargs
    .command('template', 'Create a new template', templateProcess)
    .command('project', 'Create a new project', projectProcess)
    .command('*', '', projectProcess)
    .demandCommand(1);
}
