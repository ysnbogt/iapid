import { existsSync } from 'fs';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import os from 'os';
import { join, resolve, basename } from 'path';

import chalk from 'chalk';
import highlight from 'cli-highlight';
import { prompt } from 'enquirer';

import type { FormInput } from '../types';
import type { Argv } from 'yargs';

const apiDir = join(os.homedir(), '.api');
const templatesDir = join(apiDir, 'templates');
const username = os.userInfo().username;
const projectsFilePath = join(apiDir, 'projects.json');

async function getUserInput() {
  // --- Project Name ---
  const projectName = await prompt({
    type: 'input',
    name: 'projectName',
    message: 'What is the project name?',
  });

  // --- Form Input ---
  // TODO: highlight template code(JSON)
  const formInput: FormInput = await prompt([
    {
      type: 'snippet',
      name: 'formInput',
      message: 'Please enter information about your API project.',
      required: true,
      template: highlight(
        `
        {
            "username": "${username}",
            "path": "/Users/${username}/\${path}",
            "apiTarget": "/Users/${username}/\${path}/\${apiTarget:src/pages/api}/**/*.ts",
            "origin": "\${origin}",
            "outputFileName": "\${outputFileName:endpoints.md}"
        }
        `,
        {
          language: 'json',
          ignoreIllegals: true,
        }
      ),
    },
  ]);

  // --- Output File Path ---
  const { path, outputFileName } = formInput.formInput.values;
  const outputFilePath = await prompt({
    type: 'input',
    name: 'outputFilePath',
    message: 'Please select the markdown output destination',
    initial: `/Users/${username}/${path}/${outputFileName}`,
  });

  // --- Command Type ---
  const commandType = await prompt({
    type: 'select',
    name: 'commandType',
    message: 'Choose command type:',
    choices: ['http', 'curl'],
  });

  // --- Markdown Type ---
  const templateFiles = readdirSync(templatesDir).filter(
    (file: string) =>
      file.endsWith('.tpl') && file !== 'header.tpl' && file !== 'footer.tpl'
  );
  const markdownType = await prompt({
    type: 'select',
    name: 'markdownType',
    message: 'Choose markdown type:',
    choices: templateFiles.map(file => basename(file, '.tpl')),
  });

  // Combine all answers
  const answers = {
    ...projectName,
    ...formInput.formInput.values,
    ...outputFilePath,
    ...commandType,
    ...markdownType,
  };

  const projectData = {
    [answers.projectName]: {
      ...answers,
      pathParameters: {},
    },
  };

  const existingData = existsSync(projectsFilePath)
    ? JSON.parse(readFileSync(projectsFilePath, 'utf-8'))
    : {};
  const mergedData = {
    ...existingData,
    ...projectData,
  };

  writeFileSync(projectsFilePath, JSON.stringify(mergedData, null, 2));

  console.log(`Data saved to ${projectsFilePath}`);
}

function copyFileToTemplates(absolutePath: string) {
  const filename = basename(absolutePath);
  const destPath = join(templatesDir, filename);

  // Check if file already exists in destination
  if (existsSync(destPath)) {
    console.error(
      chalk.red(`Error: File ${filename} already exists in ${templatesDir}.`)
    );
    return;
  }

  // Read file from source path
  const fileData = readFileSync(absolutePath);

  // Write file data to destination path
  writeFileSync(destPath, fileData);

  console.log(`Copied file to ${destPath}`);
}

async function templateProcess() {
  console.log('Creating new template...');

  const filePath = await prompt({
    type: 'input',
    name: 'filePath',
    message: 'Input template file path',
  }).then(answer => {
    const { filePath } = answer as { filePath: string };
    return filePath;
  });

  const absolutePath = resolve(filePath);
  copyFileToTemplates(absolutePath);
}

async function projectProcess() {
  console.log('Creating new project...');
  getUserInput();
}

export function newSubCommand(yargs: Argv) {
  return yargs
    .command('template', 'Create a new template', templateProcess)
    .command('project', 'Create a new project', projectProcess)
    .command('*', '', projectProcess)
    .demandCommand(1);
}
