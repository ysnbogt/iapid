import { readFileSync, readdirSync } from 'fs';
import net from 'net';
import os from 'os';
import { join } from 'path';

import axios, { type AxiosResponse } from 'axios';
import chalk from 'chalk';
import { glob } from 'glob';

import type { Project, Projects, Config, MarkdownType } from '../types';

export class Command {
  apiDir = join(os.homedir(), '.api');
  templatesDir = join(this.apiDir, 'templates');
  projectsFilePath = join(this.apiDir, 'projects.json');
  configFilePath = join(this.apiDir, 'config.json');
  username = os.userInfo().username;

  constructor() {
    this.checkApiDirExists = this.checkApiDirExists.bind(this);
    this.getConfig = this.getConfig.bind(this);
    this.getTemplates = this.getTemplates.bind(this);
    this.getProjects = this.getProjects.bind(this);
    this.getEndpoint = this.getEndpoint.bind(this);
    this.apiFetch = this.apiFetch.bind(this);
    this.checkPortOpen = this.checkPortOpen.bind(this);

    if (!this.checkApiDirExists()) {
      console.log(chalk.red('Error'), ': No .api directory');
      return;
    }
  }

  checkApiDirExists(): boolean {
    return readdirSync(this.apiDir).length > 0;
  }

  getConfig(): Config {
    const config = JSON.parse(readFileSync(this.configFilePath, 'utf8'));
    return config;
  }

  getTemplates(): string[] {
    const templateFiles = readdirSync(this.templatesDir).filter(file =>
      file.endsWith('.tpl')
    );
    return templateFiles;
  }

  getTemplate(markdownType: MarkdownType): string {
    return readFileSync(join(this.templatesDir, `${markdownType}.tpl`), 'utf8');
  }

  displayError(message: string): void {
    console.error(`${chalk.red('Error')}: ${message}`);
  }

  displaySuccess(message: string): void {
    console.log(`${chalk.green('Success')}: ${message}`);
  }

  getProjects(): Projects {
    const projects = JSON.parse(readFileSync(this.projectsFilePath, 'utf8'));
    if (Object.keys(projects).length === 0) {
      this.displayError('No projects');
      return {};
    }

    return projects;
  }

  getEndpoint(project: Project): string[] {
    const { path, apiTarget, origin, pathParameters } = project;

    const files = glob.sync(
      `/Users/${this.username}/${path}/${apiTarget}/**/*`,
      { nodir: true }
    );
    const endpoints: string[] = files.map(file => {
      let endpoint = file
        .split(apiTarget)[1]
        .replace(/\.ts$/, '')
        .replace(/\/index$/, '')
        .replace(/\[(.+)\]/g, ':$1');

      if (pathParameters) {
        Object.keys(pathParameters).forEach(key => {
          endpoint = endpoint.replace(key, pathParameters[key].toString());
        });
      }

      return `${origin}${endpoint}`;
    });

    return endpoints;
  }

  async apiFetch(url: string): Promise<AxiosResponse> {
    try {
      const { data } = await axios.get(url);
      return data;
    } catch (error: any) {
      this.displayError(`Failed to fetch data from ${url}: ${error.message}`);
      throw error;
    }
  }

  checkPortOpen(port: number): Promise<boolean> {
    return new Promise(resolve => {
      const server = net.createServer();

      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        }
      });

      server.once('listening', () => {
        server.close();
        resolve(true);
      });

      server.listen(port);
    });
  }
}
