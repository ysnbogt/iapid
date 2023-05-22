import { prompt } from 'enquirer';
import os from 'os';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { getEndpoint } from '../utils/getEndpoints';

const apiDir = join(os.homedir(), '.api');
const projectsFilePath = join(apiDir, 'projects.json');

export async function setSubCommand() {
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

  writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2));
}
