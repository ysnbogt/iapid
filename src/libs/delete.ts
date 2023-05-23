import { unlink, writeFileSync } from 'fs';
import { join, basename } from 'path';

import { prompt } from 'enquirer';

import { Command } from './command';

import type { Argv } from 'yargs';

export class DeleteCommand extends Command {
  constructor() {
    super();

    this.templateProcess = this.templateProcess.bind(this);
    this.projectProcess = this.projectProcess.bind(this);
    this.run = this.run.bind(this);
  }

  async templateProcess() {
    const templateFiles = this.getTemplates();
    const templates = templateFiles.map(file => basename(file, '.tpl'));
    const templateName: { templateName: string } = await prompt({
      type: 'select',
      name: 'templateName',
      message: 'Choose template:',
      choices: templates,
    });

    unlink(join(this.templatesDir, `${templateName.templateName}.tpl`), err => {
      if (err) throw err;
      this.displaySuccess(`Template ${templateName.templateName} deleted`);
    });
  }

  async projectProcess() {
    const projects = this.getProjects();
    const projectName: { projectName: string } = await prompt({
      type: 'select',
      name: 'projectName',
      message: 'Choose project:',
      choices: Object.keys(projects),
    });

    delete projects[projectName.projectName];

    writeFileSync(this.projectsFilePath, JSON.stringify(projects, null, 2));
    this.displaySuccess(`Project ${projectName.projectName} deleted`);
  }
  run(yargs: Argv) {
    return yargs
      .command('template', 'Create a new template', this.templateProcess)
      .command('project', 'Create a new project', this.projectProcess)
      .command('*', '', this.projectProcess)
      .demandCommand(1);
  }
}
