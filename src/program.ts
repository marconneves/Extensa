import {
  CommandErrorFunction,
  CommandFunction,
  Params
} from './Commands/Layer';
import Message from './Commands/Message';
import { IRoute } from './Commands/Router';

export interface Program {
  params: Params;
  routeBase?: IRoute;

  lazyStack(promises: Promise<unknown>[]): Generator<unknown, void>;

  init(): void;

  request(message: Message): void;

  use(...fn: (CommandFunction | CommandErrorFunction | IRoute)[]): void;
  use(
    path: string,
    ...fn: (CommandFunction | CommandErrorFunction | IRoute)[]
  ): void;
}

const program = { params: {} } as Program;

program.request = function request(message) {
  program.routeBase?.start(message);
};
