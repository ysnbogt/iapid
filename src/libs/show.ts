import { readFileSync } from 'fs';
import { join, basename } from 'path';

import highlight from 'cli-highlight';
import { prompt } from 'enquirer';

import { Command } from './command';

import type { Argv } from 'yargs';

export class ShowCommand extends Command {
  constructor() {
    super();

    this.templateProcess = this.templateProcess.bind(this);
    this.projectProcess = this.projectProcess.bind(this);
    this.run = this.run.bind(this);
  }

  async templateProcess() {
    const templateFiles = this.getTemplates();
    const templateName: { templateName: string } = await prompt({
      type: 'select',
      name: 'templateName',
      message: 'Choose template:',
      choices: templateFiles.map(file => basename(file, '.tpl')),
    });

    const template = readFileSync(
      join(this.templatesDir, `${templateName.templateName}.tpl`),
      'utf8'
    );

    console.log(highlight(template, { language: 'markdown' }));
  }

  async projectProcess() {
    const projects = this.getProjects();
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

  run(yargs: Argv) {
    return yargs
      .command('template', 'Create a new template', this.templateProcess)
      .command('project', 'Create a new project', this.projectProcess)
      .command('*', '', this.projectProcess)
      .demandCommand(1);
  }
}
