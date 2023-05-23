import { writeFileSync } from 'fs';

import { prompt } from 'enquirer';

import { Command } from './command';

export class SetCommand extends Command {
  constructor() {
    super();

    this.run = this.run.bind(this);
  }

  async run() {
    const { indent } = this.getConfig();

    const projects = this.getProjects();
    const projectName: { projectName: string } = await prompt({
      type: 'select',
      name: 'projectName',
      message: 'Choose project:',
      choices: Object.keys(projects),
    });

    const project = projects[projectName.projectName];
    const endpoints = this.getEndpoint(project);
    const pathParametersSet = endpoints
      .map(endpoint => {
        const pathParams = endpoint.match(/:[a-zA-Z0-9]+$/g);
        return pathParams;
      })
      .filter(pathParams => pathParams !== null)
      .flat()
      .filter((pathParam, index, self) => self.indexOf(pathParam) === index);

    const choices = pathParametersSet.map(pathParameter => {
      return {
        name: pathParameter,
        message: pathParameter,
        initial: '',
      };
    }) as any;

    const pathParameters: { pathParameters: Record<string, string> } =
      await prompt({
        type: 'form',
        name: 'pathParameters',
        message: 'Please provide the following information:',
        choices,
      });

    project.pathParameters = pathParameters.pathParameters;
    writeFileSync(
      this.projectsFilePath,
      JSON.stringify(projects, null, indent)
    );
  }
}
