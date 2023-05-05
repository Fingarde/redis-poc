"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consumer = void 0;
var redis_1 = require("redis");
var uuid_1 = require("uuid");
var command_manager_1 = require("./command-manager");
var Consumer = /** @class */ (function () {
    function Consumer(topics, clientId) {
        if (clientId === void 0) { clientId = (0, uuid_1.v4)(); }
        this.clientId = clientId;
        this.topics = topics;
        this.pub = (0, redis_1.createClient)({ url: process.env.REDIS_URL, name: this.clientId });
        this.sub = this.pub.duplicate();
        this.commandManager = new command_manager_1.CommandManager();
    }
    Consumer.prototype.register = function (command) {
        this.commandManager.register(command);
    };
    Consumer.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pub.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.sub.connect()];
                    case 2:
                        _a.sent();
                        console.log('🔥 Connected to Redis');
                        return [2 /*return*/];
                }
            });
        });
    };
    Consumer.prototype.perform = function () {
        return __awaiter(this, void 0, void 0, function () {
            var message, request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sub.blPop(this.topics, 0)];
                    case 1:
                        message = _a.sent();
                        if (!message) {
                            return [3 /*break*/, 0];
                        }
                        request = JSON.parse(message.element);
                        this.handle(request);
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Consumer.prototype.handle = function (requestMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var correlationId, replyTo, request, command, response, responseMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        correlationId = requestMessage.correlationId, replyTo = requestMessage.replyTo, request = __rest(requestMessage, ["correlationId", "replyTo"]);
                        console.log('Received request', request);
                        command = this.commandManager.get(request.action);
                        if (!command) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, command.perform(request)];
                    case 1:
                        response = _a.sent();
                        responseMessage = __assign({ correlationId: requestMessage.correlationId }, response);
                        this.pub.publish(requestMessage.replyTo, JSON.stringify(responseMessage));
                        return [2 /*return*/];
                }
            });
        });
    };
    return Consumer;
}());
exports.Consumer = Consumer;
