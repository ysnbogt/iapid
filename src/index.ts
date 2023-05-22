import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { newSubCommand } from './libs/new';
import { showSubCommand } from './libs/show';
import { listSubCommand } from './libs/list';
import { deleteSubCommand } from './libs/delete';
import { setSubCommand } from './libs/set';
import { generateSubCommand } from './libs/generate';

yargs(hideBin(process.argv))
  .command('new', 'Create new resources', newSubCommand)
  .command('show', '...', showSubCommand) // TODO
  .command('list', '...', listSubCommand) // TODO
  .command('delete', '...', deleteSubCommand) // TODO
  .command('set', '...', setSubCommand) // TODO
  .command('generate', '...', generateSubCommand) // TODO
  .demandCommand(1, 'You need at least one command before moving on')
  .help().argv;
