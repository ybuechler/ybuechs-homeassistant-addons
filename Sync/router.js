"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/** src/routes/router.ts */
const express_1 = __importDefault(require("express"));
const sync_1 = __importDefault(require("./sync"));
const router = express_1.default.Router();
router.get("/api/sync", sync_1.default.synced);
router.get("/api/status", sync_1.default.status);
exports.default = { router };
