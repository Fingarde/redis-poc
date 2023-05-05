import { Request, Response } from "../types/message";

export interface Command {
   name(): string;
   perform(req: Request): Promise<Response>
}