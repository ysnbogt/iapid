import { writeFileSync } from 'fs';

import highlight from 'cli-highlight';
import { prompt } from 'enquirer';
import { Argv } from 'yargs';

import { Command } from './command';

export class GenerateCommand extends Command {
  yargs: Argv;
  indent: number;
  numberOfItems: number;
  defaultResponseMessage: string;
  exceededResponseMessage: string;

  constructor(yargs: Argv) {
    super();

    const { select, display, call, indent, numberOfItems, responseMessage } =
      this.getConfig();
    const { _default, exceeded } = responseMessage;

    this.indent = indent;
    this.numberOfItems = numberOfItems;
    this.defaultResponseMessage = _default;
    this.exceededResponseMessage = exceeded;
    this.yargs = yargs
      .options('select', {
        alias: 's',
        type: 'boolean',
        description: 'Select endpoints to generate markdowns.',
        default: select,
      })
      .options('display', {
        alias: 'd',
        type: 'boolean',
        description: 'Display markdowns instead of writing to file.',
        default: display,
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
        default: call,
      });

    this.run = this.run.bind(this);
  }

  async run() {
    const { select, max, display, call }: any = this.yargs.argv;

    const projects = this.getProjects();
    const projectName: { projectName: string } = await prompt({
      type: 'select',
      name: 'projectName',
      message: 'Choose project:',
      choices: Object.keys(projects),
    });

    const project = projects[projectName.projectName];
    const endpoints = this.getEndpoint(project);
    const { origin, markdownType, commandType, outputFilePath } = project;
    const port = Number(origin.split(':')[2].split('/')[0]);

    const template = this.getTemplate(markdownType);
    const header = this.getTemplate('header');
    const footer = this.getTemplate('footer');

    if (select) {
      const { selectedEndpoints }: any = await prompt({
        type: 'multiselect',
        name: 'selectedEndpoints',
        message: 'Choose endpoints:',
        choices: endpoints,
      });

      const markdowns = await selectedEndpoints.map(
        async (endpoint: string) => {
          let isExceeded = false;
          let json = '';

          if (markdownType === 'code_with_result' || call) {
            if (await this.checkPortOpen(port)) {
              this.displayError(
                `Port ${port} is not open. Please run the server first.`
              );
              throw new Error();
            }

            const response = await this.apiFetch(endpoint);
            if (Array.isArray(response) && response.length > max) {
              json = JSON.stringify(response.slice(0, max), null, this.indent);
              isExceeded = true;
            } else {
              json = JSON.stringify(response, null, this.indent);
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
                ? this.exceededResponseMessage.replace(
                    /{{ numberOfItems }}/g,
                    String(this.numberOfItems)
                  )
                : this.defaultResponseMessage
            );
          return markdown;
        }
      );

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
}
