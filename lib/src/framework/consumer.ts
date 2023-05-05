import { createClient, RedisClientType } from "redis";
import { v4 as uuidv4 } from "uuid";

import { CommandManager } from "./command-manager";
import { CreateUserCommand, GetUserCommand } from "./command";

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

export class Consumer {
  private pub: RedisClientType;
  private sub: RedisClientType;
  private topics: string[];
  private clientId: string;
  private commandManager: CommandManager;

  constructor(topics: string[], clientId: string = uuidv4()) {
    this.clientId = clientId;
    this.topics = topics;

    this.pub = createClient({ url: process.env.REDIS_URL, name: this.clientId });
    this.sub = this.pub.duplicate();
    this.commandManager = new CommandManager();

    this.registerCommands();
  }

  private registerCommands() {
    console.debug('Registering commands');
    this.commandManager.register(new CreateUserCommand());
    this.commandManager.register(new GetUserCommand());
  }

  public async connect() {
    await this.pub.connect();
    await this.sub.connect();

    console.log('🔥 Connected to Redis')
  }

  public async perform() {
    while(true) {
      let message = await this.sub.blPop(this.topics, 0);
      if (!message) { continue; }

      let request: RequestMessage = JSON.parse(message.element);

      this.handle(request);
    }
  }

  private async handle(request: RequestMessage) {
    let command = this.commandManager.get(request.action);
    if (!command) { return; }

    let response: Response = await command.perform(request);

    let responseMessage: ResponseMessage = {
      correlationId: request.correlationId,
      ...response
    };

    console.debug('Sending response: ', responseMessage);

    this.pub.publish(request.replyTo, JSON.stringify(responseMessage));
  }
}
