/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Trace {
  id?: string;
  crumbs: string[];
}

interface MessageData<T = undefined> {
  path: string;
  trace: Trace;
  headers: { [key: string]: string };
  body?: T;
}

class Message<T = undefined> {
  public path!: string;

  trace!: Trace;

  headers: { [key: string]: string } = {};

  body?: T;

  constructor(data: MessageData) {
    this.path = data.path;
    this.trace = data.trace;
    this.headers = data.headers;
    this.body = data.body;
  }

  setCrumb(crumb: string) {
    this.trace.crumbs.push(crumb);
  }

  removeCrumb() {
    this.trace.crumbs.pop();
  }
}

export default Message;
