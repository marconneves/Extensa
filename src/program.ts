import Debug from 'debug';
import { CommandErrorFunction, CommandFunction } from './Commands/Layer';
import { Message, MessageData } from './Commands/Message';
import { IRoute, Router } from './Commands/Router';

const debug = Debug('cowmand:program');

export interface IOptionsProgram {
  key: string;
}

export interface Program {
  routeBase?: IRoute;
  options: IOptionsProgram;

  init(options?: IOptionsProgram): void;

  use(...fn: (CommandFunction | CommandErrorFunction | IRoute)[]): void;
  use(
    path: string,
    ...fn: (CommandFunction | CommandErrorFunction | IRoute)[]
  ): void;

  request(message: MessageData): void;
}

const program = {} as Program;

program.init = function init(options?: IOptionsProgram) {
  this.options = options || {
    key: 'unique'
  };
};

program.use = function use() {
  if (!this.routeBase) {
    this.routeBase = Router();
    debug('create route base');
  }

  debug('use in route base');
  this.routeBase.use(...arguments);
};

program.request = function request(messageRequest) {
  const message = new Message(messageRequest);

  message.setCrumb({
    type: 'worker',
    destination: this.options.key
  });

  program.routeBase?.execute(message);
};

export default program;
