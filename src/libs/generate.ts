import { prompt } from 'enquirer';
import os from 'os';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { getEndpoint } from '../utils/getEndpoints';
import { Argv } from 'yargs';
import { fetcher } from '../utils/fetcher';
import { getTemplate } from '../utils/getTemplate';

const apiDir = join(os.homedir(), '.api');
const projectsFilePath = join(apiDir, 'projects.json');
const configFilePath = join(apiDir, 'config.json');

export async function generateSubCommand(yargs: Argv) {
  const {
    select: defaultSelect,
    display: defaultDisplay,
    call: defaultCall,
    indent,
    numberOfItems,
    responseMessage,
  } = JSON.parse(readFileSync(configFilePath, 'utf8'));
  const { default: defaultMessage, exceeded: exceededMessage } =
    responseMessage;

  yargs
    .options('select', {
      alias: 's',
      type: 'boolean',
      description: '...', // TODO
      default: defaultSelect,
    })
    .options('display', {
      alias: 'd',
      type: 'boolean',
      description: '...', // TODO
      default: defaultDisplay,
    })
    .options('max', {
      alias: 'm',
      type: 'number',
      description: '...', // TODO
      default: numberOfItems,
    })
    .options('call', {
      alias: 'c',
      type: 'boolean',
      description: '...', // TODO
      default: defaultCall,
    });

  const { select, max, display, call }: any = yargs.argv;

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
  const { markdownType, commandType, outputFilePath } = project;

  const template = getTemplate(markdownType);
  const header = getTemplate('header');
  const footer = getTemplate('footer');

  if (select) {
    const { selectedEndpoints }: any = await prompt({
      type: 'multiselect',
      name: 'selectedEndpoints',
      message: 'Choose endpoints:',
      choices: endpoints,
    });

    const markdowns = await selectedEndpoints.map(async (endpoint: string) => {
      let isExceeded = false;
      let json = '';

      if (markdownType === 'code_with_result' || call) {
        const response = await fetcher(endpoint);
        if (Array.isArray(response) && response.length > max) {
          json = JSON.stringify(response.slice(0, max), null, Number(indent));
          isExceeded = true;
        } else {
          json = JSON.stringify(response, null, Number(indent));
        }
      }

      const short = endpoint.split('/api')[1];
      const command = `${commandType} ${endpoint}`;

      const markdown = template
        .replace(/{{ short }}/g, short)
        .replace(/{{ long }}/g, endpoint)
        .replace(/{{ response }}/g, json)
        .replace(/{{ command }}/g, command)
        .replace(
          /{{ responseMessage }}/g,
          isExceeded
            ? exceededMessage.replace(/{{ numberOfItems }}/g, numberOfItems)
            : defaultMessage
        );
      return markdown;
    });

    const content = await Promise.all(markdowns).then(markdowns => {
      return [header, ...markdowns, footer].join('\n');
    });

    if (!display) {
      writeFileSync(project.outputFilePath, content);
    } else {
      console.log(content);
    }
  }
}
