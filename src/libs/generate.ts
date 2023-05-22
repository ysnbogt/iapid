import { readFileSync, writeFileSync } from 'fs';
import os from 'os';
import { join } from 'path';

import chalk from 'chalk';
import highlight from 'cli-highlight';
import { prompt } from 'enquirer';
import { Argv } from 'yargs';

import { checkPortOpen } from '../utils/checkPortOpen';
import { fetcher } from '../utils/fetcher';
import { getEndpoint } from '../utils/getEndpoints';
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
      description: 'Select endpoints to generate markdowns.',
      default: defaultSelect,
    })
    .options('display', {
      alias: 'd',
      type: 'boolean',
      description: 'Display markdowns instead of writing to file.',
      default: defaultDisplay,
    })
    .options('max', {
      alias: 'm',
      type: 'number',
      description: 'Maximum number of items to display.',
      default: numberOfItems,
    })
    .options('call', {
      alias: 'c',
      type: 'boolean',
      description: 'Call the endpoint to get the response.',
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
  const { origin, markdownType, commandType, outputFilePath } = project;
  const port = Number(origin.split(':')[2].split('/')[0]);

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
        if (await checkPortOpen(port)) {
          console.log(
            `${chalk.red(
              'ERROR'
            )}: Port ${port} is not open. Please run the server first.`
          );
          process.exit(1);
        }

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
      return [header, ...markdowns, footer].join('');
    });

    if (!display) {
      writeFileSync(outputFilePath, content);
    } else {
      console.log(highlight(content, { language: 'markdown' }));
    }
  }
}
