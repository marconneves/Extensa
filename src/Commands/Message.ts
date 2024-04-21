/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Trace {
  id?: string;
  crumbs: string[];
}

export interface MessageData<T = undefined> {
  path: string;
  trace: Trace;
  headers: { [key: string]: string };
  body?: T;
}

export class Message<T = unknown> {
  readonly path!: string;

  readonly trace!: Trace;

  readonly headers: { [key: string]: string } = {};

  body?: T;

  constructor(data: MessageData) {
    this.path = data.path;
    this.trace = data.trace;
    this.headers = data.headers;
    if (data.body) this.body = data.body;
  }

  setCrumb({ type, destination }: { type: string; destination: string }) {
    this.trace.crumbs.push(`${type}#${destination}`);
  }

  removeCrumb() {
    this.trace.crumbs.pop();
  }

  get destination(): {
    type: 'internal' | 'contentScript';
    destination: string;
  } {
    const [type, destination] =
      this.trace.crumbs[this.trace.crumbs.length - 1].split('#');

    return {
      type: type as 'internal' | 'contentScript',
      destination
    };
  }

  setResponse(body: T) {
    this.body = body;
  }
}
