import { glob } from 'glob';
import type { Project } from '../types';
import os from 'os';

const options = {
  nodir: true,
};

const username = os.userInfo().username;

export function getEndpoint(project: Project): string[] {
  const { path, apiTarget, origin, pathParameters } = project;

  const files = glob.sync(
    `/Users/${username}/${path}/${apiTarget}/**/*`,
    options
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
