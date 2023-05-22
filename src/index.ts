import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { deleteSubCommand } from './libs/delete';
import { generateSubCommand } from './libs/generate';
import { listSubCommand } from './libs/list';
import { newSubCommand } from './libs/new';
import { setSubCommand } from './libs/set';
import { showSubCommand } from './libs/show';

yargs(hideBin(process.argv))
  .command('new', 'Create new resources', newSubCommand)
  .command('show', 'Show resources', showSubCommand)
  .command('list', 'List resources', listSubCommand)
  .command('delete', 'Delete resources', deleteSubCommand)
  .command('set', "Set resource's properties", setSubCommand)
  .command('generate', 'Generate resources', generateSubCommand)
  .demandCommand(1, 'You need at least one command before moving on')
  .help().argv;
