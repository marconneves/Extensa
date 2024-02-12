import Debug from 'debug';
import { IRoute } from './Router';
import { Trace } from './Message';

const debug = Debug('cowmand:layer');

export interface Params {
  path: string;
  pathItems: string[];
}

export interface Request<T = unknown, P = { [key: string]: string }> {
  trace: Trace;

  params?: P;
  body?: T;
}

export interface Response {
  send: (body: unknown) => void;
}

export type NextFunctionError = (error?: Error) => void;
export type NextFunctionSuccess = () => void;

export type NextFunction = NextFunctionSuccess | NextFunctionError;

export type CommandFunction = (
  request: Request,
  response: Response,
  nextFunction: NextFunction
) => void | Promise<void>;

export type CommandErrorFunction = (
  request: Request,
  response: Response,
  nextFunction: NextFunctionError,
  error: Error
) => void;

export interface OptionsLayer {
  pathItems: string[];
  isRouter?: boolean;
}

export interface ILayer {
  match: (params: Params) => void;
}

/**
 * To Create Layer
 * @param handle (function)
 * @param next (function)
 * @param notInCommandList (boolean)
 * @param command (function)
` */

class Layer implements ILayer {
  private readonly name: string;

  public handle?: CommandFunction;

  public handleError?: CommandErrorFunction;

  public path: string;

  public pathItems: string[];

  public baseMathSetting: { isRoot: boolean };

  public isRouter: boolean;

  public route?: IRoute;

  constructor(
    path: string | undefined,
    options: OptionsLayer,
    executor: CommandFunction | CommandErrorFunction,
    route?: IRoute
  ) {
    if (executor.length <= 3) {
      this.handle = executor as unknown as CommandFunction;
    }
    if (executor.length > 3) {
      this.handleError = executor as unknown as CommandErrorFunction;
    }
    if (route) {
      this.route = route;
    }

    this.name = executor.name || 'anonymous';
    this.path = path || '/';
    this.pathItems = options.pathItems || [];
    this.isRouter = options.isRouter || false;

    debug('new %s:%s', this.name, path);

    this.baseMathSetting = { isRoot: path === '/' };
  }

  match(params: Params) {
    if (params.pathItems.length > this.pathItems.length) {
      return false;
    }

    return this.pathItems.reduce<boolean | null>((acc, pathItem, index) => {
      if (acc === false) {
        return false;
      }

      const response = params.pathItems[index] === pathItem;

      return response;
    }, null);
  }
}

export { Layer };
