"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandManager = void 0;
var CommandManager = /** @class */ (function () {
    function CommandManager() {
        this.commands = new Map();
    }
    CommandManager.prototype.register = function (command) {
        console.debug("\t - ".concat(command.name()));
        this.commands.set(command.name().toUpperCase(), command);
    };
    CommandManager.prototype.get = function (commandName) {
        return this.commands.get(commandName.toUpperCase()) || null;
    };
    return CommandManager;
}());
exports.CommandManager = CommandManager;
