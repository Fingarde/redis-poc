import { createClient, RedisClientType } from "redis";
import { v4 as uuidv4 } from "uuid";

export type Response = {
  data?: any;
  error?: any;
};

export type Request = {
  action: string;
  data?: any;
};

type ResponseMessage = {
  correlationId: string;
  data?: any;
  error?: any;
};

type RequestMessage = {
  correlationId : string;
  replyTo: string;

  action: string;
  data?: any;
};

export class Messaging {
  private pub: RedisClientType;
  private sub: RedisClientType;
  private responseHandlers: { [key: string]: (value: Response) => void } = {};
  private clientId: string;

  constructor(clientId: string = uuidv4()) {
    this.clientId = clientId;

    this.pub = createClient({ url: process.env.REDIS_URL, name: clientId });
    this.sub = this.pub.duplicate();
  }

  async connect() {
    await this.sub.connect();
    await this.pub.connect();
    
    console.log("⚡️ Connected to redis");

    this.sub.subscribe(this.clientId, (message) => {
      const responseMessage: ResponseMessage = JSON.parse(message);
      const handler = this.responseHandlers[responseMessage.correlationId];

      const response: Response = { ...responseMessage };
      if (handler) {
        handler(response);
      }
    });
  }

  async publish(queue: string, request: Request): Promise<Response> {
    const id = uuidv4();

    const promise = new Promise<Response>((resolve) => {
      this.responseHandlers[id] = resolve;
      console.log(Object.keys(this.responseHandlers));

    });

    const requestMessage: RequestMessage = {
      ...request,
      correlationId: id,
      replyTo: this.clientId
    };

    const json = JSON.stringify(
      requestMessage,
    );

    this.pub.publish(queue, json);

    return await promise;
  }
}
