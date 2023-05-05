import { Request, Response } from "./consumer";

export interface Command {
   name(): string;
   perform(req: Request): Promise<Response>
}

export class CreateUserCommand implements Command {
    private static commandName: string = "CreateUserCommand";

    public async perform(req: Request): Promise<Response> {
        return Promise.resolve({});
    }

    public name(): string {
        return CreateUserCommand.commandName;
    }
}