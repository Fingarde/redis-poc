import { Command } from "../lib/command";
import { Request, Response } from "../types/message";

import { getUser } from "../service/user-service";
import { Error } from "../types/error";

type GetUserOptions = {
    id: number;
}

export class GetUserCommand implements Command {
    private static commandName: string = "GetUser";

    public async perform(req: Request): Promise<Response> {
        let options: GetUserOptions = req.data;
        
        let user = await getUser(options.id);
        
        if (isError(user)) {
            return {
                error: user
            };
        }

        return {
            data: user
        };
    }

    public name(): string {
        return GetUserCommand.commandName;
    }
}

function isError(value: any): value is Error {
    return (value as Error).code !== undefined;
} 