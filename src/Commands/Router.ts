import Debug from 'debug';
import { CommandErrorFunction, CommandFunction, Layer, Params } from './Layer';
import Message from './Message';

const debug = Debug('cowmand:Router');

export interface IRoute {
  stack: Layer[];
  name: string;
  message: Message;
  params: Params;

  start(message: Message, params?: Params): void;

  use(fn: IRoute): void;
  use(path: string, fn: IRoute): void;
  use(...fn: CommandFunction[]): void;
  use(path: string, ...fn: CommandFunction[]): void;
  use(fn: CommandErrorFunction): void;
}

const proto = {} as IRoute;

proto.use = function use(firstArgument) {
  let offset = 0;
  let path = '/';
  let pathItems = [];

  if (typeof firstArgument !== 'function' && firstArgument?.name !== 'router') {
    offset = 1;

    path = firstArgument;
    pathItems = firstArgument.split('/').filter(pathItem => !!pathItem);
  }

  const callbacks = (
    Object.values(arguments) as unknown as (
      | CommandFunction
      | CommandErrorFunction
      | IRoute
    )[]
  ).slice(offset);

  for (let i = 0; i < callbacks.length; i++) {
    const callback = callbacks[i];

    debug("use middleware %s on '%s'", callback.name, path);

    if (callback.name === 'router') {
      this.stack.push(
        new Layer(
          path,
          {
            pathItems,
            isRouter: callback.name === 'router'
          },
          () => undefined,
          callback as IRoute
        )
      );
    } else {
      this.stack.push(
        new Layer(
          path,
          {
            pathItems
          },
          callback as CommandFunction | CommandErrorFunction
        )
      );
    }
  }
};

proto.start = function start(message: Message, params?: Params) {
  let index = 0;

  this.message = message;
  this.params = params ?? {
    path: message.path,
    pathItems: message.path.split('/').filter(pathItem => pathItem !== '')
  };

  const next = (error?: Error) => {
    if (error) console.log(error);

    if (index >= this.stack.length) {
      return;
    }

    let layerStack: Layer;
    let match;

    while (match !== true && index < this.stack.length) {
      layerStack = this.stack[index];
      match = layerStack.match(this.params);

      index++;

      if (!match) continue;

      if (error && !layerStack.handleError) continue;

      if (layerStack.isRouter) {
        console.log('AAA');
        const sliceStartOn =
          layerStack.path && layerStack.path?.startsWith('/') ? 1 : 0;

        const newPath = message.path
          .slice(sliceStartOn)
          .replace(params?.path || '', '');

        const internalParams = {
          path: newPath,
          pathItems: newPath.split('/')
        } as Params;

        layerStack.route?.start(message, internalParams);
      }

      if (error && layerStack.handleError) {
        layerStack.handleError(
          { trace: message.trace, body: message.body, params: {} },
          { send: console.error },
          next,
          error
        );
      }

      if (layerStack.handle) {
        layerStack.handle(
          { trace: message.trace, body: message.body, params: {} },
          { send: oi => console.error('handle', oi) },
          next
        );
      }

      return;
    }
  };

  next();
};

function Router() {
  const route = {
    ...proto,
    name: 'router',
    stack: [] as Layer[]
  };

  return route;
}

export { Router };
