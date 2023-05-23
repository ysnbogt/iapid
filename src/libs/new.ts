import { existsSync } from 'fs';
import { readFileSync, writeFileSync } from 'fs';
import { join, resolve, basename } from 'path';

import highlight from 'cli-highlight';
import { prompt } from 'enquirer';

import { Command } from './command';

import type { FormInput } from '../types';
import type { Argv } from 'yargs';

export class NewCommand extends Command {
  constructor() {
    super();

    this.templateProcess = this.templateProcess.bind(this);
    this.projectProcess = this.projectProcess.bind(this);
    this.run = this.run.bind(this);
  }

  async getUserInput() {
    // --- Project Name ---
    const projectName = await prompt({
      type: 'input',
      name: 'projectName',
      message: 'What is the project name?',
    });

    // --- Form Input ---
    const formInput: FormInput = await prompt([
      {
        type: 'snippet',
        name: 'formInput',
        message: 'Please enter information about your API project.',
        required: true,
        template: highlight(
          `
        {
            "username": "${this.username}",
            "path": "/Users/${this.username}/\${path}",
            "apiTarget": "/Users/${this.username}/\${path}/\${apiTarget:src/pages/api}/**/*.ts",
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
      initial: `/Users/${this.username}/${path}/${outputFileName}`,
    });

    // --- Command Type ---
    const commandType = await prompt({
      type: 'select',
      name: 'commandType',
      message: 'Choose command type:',
      choices: ['http', 'curl'],
    });

    // --- Markdown Type ---
    const templateFiles = this.getTemplates();
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

    const existingData = existsSync(this.projectsFilePath)
      ? JSON.parse(readFileSync(this.projectsFilePath, 'utf-8'))
      : {};
    const mergedData = {
      ...existingData,
      ...projectData,
    };

    writeFileSync(this.projectsFilePath, JSON.stringify(mergedData, null, 2));

    this.displaySuccess(`Project ${answers.projectName} created`);
  }

  copyFileToTemplates(absolutePath: string) {
    const filename = basename(absolutePath);
    const destPath = join(this.templatesDir, filename);

    // Check if file already exists in destination
    if (existsSync(destPath)) {
      this.displayError('File already exists in templates directory');
      process.exit(1);
    }

    // Read file from source path
    const fileData = readFileSync(absolutePath);

    // Write file data to destination path
    writeFileSync(destPath, fileData);

    this.displaySuccess(`Copied file to ${destPath}`);
  }

  async templateProcess() {
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
    this.copyFileToTemplates(absolutePath);
  }

  async projectProcess() {
    console.log('Creating new project...');
    this.getUserInput();
  }

  run(yargs: Argv) {
    return yargs
      .command('template', 'Create a new template', this.templateProcess)
      .command('project', 'Create a new project', this.projectProcess)
      .command('*', '', this.projectProcess)
      .demandCommand(1);
  }
}
