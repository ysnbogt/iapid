import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
  NewCommand,
  ShowCommand,
  ListCommand,
  DeleteCommand,
  SetCommand,
  GenerateCommand,
  UpdateCommand,
} from './libs/commands';

// process.on('unhandledRejection', () => {
//   process.exit(1);
// });

yargs(hideBin(process.argv))
  .command('new', 'Create new resources', new NewCommand().run)
  .command('show', 'Show resources', new ShowCommand().run)
  .command('list', 'List resources', new ListCommand().run)
  .command('delete', 'Delete resources', new DeleteCommand().run)
  .command('set', "Set resource's properties", new SetCommand().run)
  .command('generate', 'Generate resources', new GenerateCommand(yargs).run)
  .command('update', 'Update resources', new UpdateCommand().run)
  .demandCommand(1, 'You need at least one command before moving on')
  .help().argv;
