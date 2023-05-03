"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var accesscontrol_1 = require("accesscontrol");
var ac = new accesscontrol_1.AccessControl();
ac.grant('user')
    .readOwn('account')
    .updateOwn('account');
ac.grant('admin')
    .createAny('account')
    .updateAny('account')
    .readAny('account')
    .deleteAny('account');
exports.default = ac;
