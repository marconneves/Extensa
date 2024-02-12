import proto, { IOptionsProgram as ExtensaOptions } from './program';

function createApp(options?: ExtensaOptions) {
  const program = proto;

  program.init(options);
  return program;
}

export { Request, Response, NextFunction } from './Commands/Layer';
export { Router } from './Commands/Router';
export { Message } from './Commands/Message';

export { createApp };
export default createApp;
