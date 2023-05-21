"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bring_shopping_1 = __importDefault(require("bring-shopping"));
//@ts-ignore
const options_json_1 = __importDefault(require("./data/options.json"));
/**
 * Adds functions of Bring API
 */
class Bring {
    constructor(mail, password) {
        this.bring = new bring_shopping_1.default({ mail: mail, password: password });
        this.login();
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bring.login();
        });
    }
    add(list, element, description) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bring.saveItem(list, element, description);
        });
    }
    getItems(bringList) {
        const result = this.bring.getItems(options_json_1.default.bringList);
        return result;
    }
}
const synced = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    log("Starting the sync");
    if (!options_json_1.default) {
        console.log("No config File! no sync will be done");
        return;
    }
    const bring = new Bring(options_json_1.default.bringEmail, options_json_1.default.bringPassword);
    const result = yield getMissingProducts();
    let items;
    try {
        items = (yield bring.getItems(options_json_1.default.bringList)).purchase;
    }
    catch (_a) {
        log("GetItems failed!");
    }
    let itemsAdded = [];
    //add missing products to bring
    result.missing_products.forEach((element) => __awaiter(void 0, void 0, void 0, function* () {
        if (!items.find((item) => item.name == element.name)) {
            try {
                bring.add(options_json_1.default.bringList, element.name, element.amount_missing.toString());
                itemsAdded.push(element.name);
                log("Adding item: " + element.name);
            }
            catch (_b) {
                log("Adding Items failed!");
            }
        }
    }));
    //PING Uptime Kuma
    if (options_json_1.default.uptimeKumePingUrl) {
        let uptimeKumaConfig = {
            method: "GET",
            headers: {},
        };
        if (options_json_1.default.serviceTokenId && options_json_1.default.serviceTokenSecret) {
            uptimeKumaConfig.headers["CF-Access-Client-Id"] = options_json_1.default.serviceTokenId;
            uptimeKumaConfig.headers["CF-Access-Client-Secret"] =
                options_json_1.default.serviceTokenSecret;
        }
        fetch(options_json_1.default.uptimeKumePingUrl, uptimeKumaConfig);
        log("Send notification to Uptime Kuma");
    }
    log("Finished the sync!");
    return res.status(200).json({
        status: "ok",
        itemsAdded: itemsAdded,
    });
});
function log(message) {
    console.log(new Date().toLocaleString("de-ch") + " - " + message);
}
/**
 * Gets missing Products from Grocy via API
 * @returns Array of Missing Products
 */
function getMissingProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        let GrocyConfig = {
            method: "GET",
            headers: {
                "GROCY-API-KEY": options_json_1.default.grocyApiKey,
            },
        };
        if (options_json_1.default.serviceTokenId && options_json_1.default.serviceTokenSecret) {
            GrocyConfig.headers["CF-Access-Client-Id"] = options_json_1.default.serviceTokenId;
            GrocyConfig.headers["CF-Access-Client-Secret"] = options_json_1.default.serviceTokenSecret;
        }
        const response = yield fetch(options_json_1.default.grocyBaseUrl + "/stock/volatile", GrocyConfig);
        const result = (yield response.json());
        return result;
    });
}
const status = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json({
        status: "ok",
    });
});
exports.default = { synced, status };
