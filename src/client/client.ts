import { v4 as uuidV4 } from 'uuid';

import { MessageData } from '../Commands/Message';
import { Message } from '../extensa';
import { MethodsEnum } from './enums/MethodsEnum';

// document.addEventListener('whatsapp:<=:content-script', async baseEvent => {
//   const event = baseEvent as CustomEvent<Message>;
//   if (event.detail.group === 'worker-api') {
//     const item = apiStack.find(
//       apiItem => apiItem.path === event.detail.data.path
//     );

//     if (!item) {
//       return;
//     }

//     item.resolve(event.detail.data.body);
//     apiStack.splice(apiStack.indexOf(item), 1);
//   }
// });

type Types = 'internal' | 'contentScript';

interface Destination {
  destination: string;
  type?: 'worker';
}

interface Identify {
  key?: string;
  type?: Types;
}

class Client {
  private stack: {
    method: MethodsEnum;
    path: string;
    id: string;
    resolve: (value: unknown) => void;
  }[] = [];

  key: string;

  type: Types;

  destination: Destination;

  constructor(destination: Destination, identify?: Identify) {
    this.key = identify?.key || 'unique-client';
    this.type = identify?.type || 'internal';

    this.destination = destination;
  }

  private async sendRequest(message: Message) {
    if (this.type === 'internal') {
      await chrome.runtime.sendMessage(chrome.runtime.id, {
        key: 'extensa:response',
        destination: '',
        message
      });
    }
  }

  async query<T>(
    method: MethodsEnum,
    path: string,
    body?: unknown
  ): Promise<T> {
    const response = await new Promise(resolve => {
      const traceId = uuidV4();
      const messageRequest = new Message({
        trace: { id: traceId, crumbs: [] },
        headers: {},
        path,
        body
      } as MessageData);

      messageRequest.setCrumb({
        type: this.type,
        destination: this.key
      });

      this.sendRequest(messageRequest);

      this.stack.push({
        id: traceId,
        method,
        path,
        resolve
      });
    });

    return response as T;
  }

  async get<T>(path: string, body?: unknown): Promise<T> {
    return this.query<T>(MethodsEnum.GET, path, body);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.query<T>(MethodsEnum.POST, path, body);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.query<T>(MethodsEnum.PUT, path, body);
  }

  async delete<T>(path: string, body?: unknown): Promise<T> {
    return this.query<T>(MethodsEnum.DELETE, path, body);
  }
}

export default Client;
