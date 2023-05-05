import { createClient, RedisClientType } from "redis";
import { v4 as uuidv4 } from "uuid";

import { CommandManager } from "./command-manager";
import { Command } from "./command";

import { RequestMessage, ResponseMessage, Response, Request } from "../types/message";

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
  }

  public register(command: Command) {
    this.commandManager.register(command);
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

  private async handle(requestMessage: RequestMessage) {
    const {correlationId, replyTo, ...request} = requestMessage;

    console.log('Received request', request);

    let command = this.commandManager.get(request.action);
    if (!command) { return; }

    let response: Response = await command.perform(request);

    let responseMessage: ResponseMessage = {
      correlationId: requestMessage.correlationId,
      ...response
    };

    this.pub.publish(requestMessage.replyTo, JSON.stringify(responseMessage));
  }
}
