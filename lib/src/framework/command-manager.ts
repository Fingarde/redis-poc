import { Command } from "./command";

export class CommandManager {
    private commands: Map<string, Command>;

    constructor() {
        this.commands = new Map();
    }

    register(command: Command) {
        console.debug(`\t - ${command.name()}`);
        this.commands.set(command.name().toUpperCase(), command);
    }

    get(commandName: string): Command | null {
        return this.commands.get(commandName.toUpperCase()) || null;
    }
}