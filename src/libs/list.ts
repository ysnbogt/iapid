import { basename } from 'path';

import chalk from 'chalk';
import { prompt } from 'enquirer';

import { Command } from './command';

import type { Argv } from 'yargs';

export class ListCommand extends Command {
  constructor() {
    super();

    this.templateProcess = this.templateProcess.bind(this);
    this.projectProcess = this.projectProcess.bind(this);
    this.run = this.run.bind(this);
  }

  async templateProcess() {
    const templateFiles = this.getTemplates();
    const templates = templateFiles.map(file => basename(file, '.tpl'));

    templates.forEach(template => {
      console.log(`- ${template}`);
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

    const project = projects[projectName.projectName];
    const endpoints = this.getEndpoint(project);
    endpoints.forEach(endpoint => {
      console.log(`- ${chalk.blue(endpoint)}`);
    });
  }

  async run(yargs: Argv) {
    return yargs
      .command('template', 'Create a new template', this.templateProcess)
      .command('project', 'Create a new project', this.projectProcess)
      .command('*', '', this.projectProcess)
      .demandCommand(1);
  }
}
