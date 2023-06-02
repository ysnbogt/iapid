import { existsSync, readFileSync, writeFileSync } from 'fs';
import { basename } from 'path';

import highlight from 'cli-highlight';
import { prompt } from 'enquirer';

import { Command } from './command';

import type { FormInput } from '../types';

export class UpdateCommand extends Command {
  constructor() {
    super();

    this.run = this.run.bind(this);
  }

  async run() {
    // [x] 1. プロジェクトの選択
    // [x] 2. プロジェクトの情報を取得
    // [ ] 3. プロジェクトの情報をフォームでデフォルト値として表示
    //   - origin だけエスケープできていない
    // [ ] 4. フォームの入力を受け取る
    // [ ] 5. フォームの入力をプロジェクトの情報に反映
    // [ ] 6. プロジェクトの情報を保存

    const projects = this.getProjects();

    // --- Project Name ---
    const projectName: { projectName: string } = await prompt({
      type: 'select',
      name: 'projectName',
      message: 'Choose project:',
      choices: Object.keys(projects),
    });

    const { path, apiTarget, origin, outputFileName } =
      projects[projectName.projectName];

    // --- Form Input ---
    const updatedFormInput: FormInput = await prompt([
      {
        type: 'snippet',
        name: 'formInput',
        message: 'Please enter information about your API project.',
        required: true,
        template: highlight(
          `
            {
                "username": "${this.username}",
                "path": "/Users/${this.username}/\${path:${path}}",
                "apiTarget": "/Users/${this.username}/\${path:${path}}/\${apiTarget:${apiTarget}}/**/*.ts",
                "outputFileName": "\${outputFileName:${outputFileName}}"
            }
            `,
          {
            language: 'json',
            ignoreIllegals: true,
          }
        ),
      },
    ]);

    // --- Origin ---
    const updatedOrigin = await prompt({
      type: 'input',
      name: 'origin',
      message: 'Please enter the origin of the API',
      initial: origin,
    });

    // --- Output File Path ---
    const updatedOutputFilePath = await prompt({
      type: 'input',
      name: 'outputFilePath',
      message: 'Please select the markdown output destination',
      initial: `/Users/${this.username}/${path}/${outputFileName}`,
    });

    // --- Command Type ---
    const updatedCommandType = await prompt({
      type: 'select',
      name: 'commandType',
      message: 'Choose command type:',
      choices: ['http', 'curl'],
    });

    // --- Markdown Type ---
    const templateFiles = this.getTemplates();
    const updatedMarkdownType = await prompt({
      type: 'select',
      name: 'markdownType',
      message: 'Choose markdown type:',
      choices: templateFiles
        .map(file => basename(file, '.tpl'))
        .filter(name => name !== 'header' && name !== 'footer'),
    });

    // Combine all answers
    const answers = {
      ...projectName,
      ...updatedFormInput.formInput.values,
      ...updatedOutputFilePath,
      ...updatedCommandType,
      ...updatedMarkdownType,
      ...updatedOrigin,
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
}
