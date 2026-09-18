"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
var common_1 = require("@nestjs/common");
var ioredis_1 = require("ioredis");
var RedisService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RedisService = _classThis = /** @class */ (function () {
        function RedisService_1(configService) {
            this.configService = configService;
            this.logger = new common_1.Logger(RedisService.name);
            this.client = null;
            this.isConnected = false;
        }
        RedisService_1.prototype.onModuleInit = function () {
            var _this = this;
            var isRedisEnabled = this.configService.get('REDIS_ENABLED', 'true') === 'true';
            if (!isRedisEnabled) {
                this.logger.warn('Redis is disabled by REDIS_ENABLED=false configuration.');
                return;
            }
            var host = this.configService.get('REDIS_HOST', '127.0.0.1');
            var port = Number(this.configService.get('REDIS_PORT', 6379));
            var password = this.configService.get('REDIS_PASSWORD', '');
            var db = Number(this.configService.get('REDIS_DB', 0));
            var keyPrefix = this.configService.get('REDIS_KEY_PREFIX', 'raphamis:');
            var tlsEnabled = this.configService.get('REDIS_TLS', 'false') === 'true';
            try {
                this.client = new ioredis_1.default({
                    host: host,
                    port: port,
                    password: password ? password : undefined,
                    db: db,
                    keyPrefix: keyPrefix,
                    tls: tlsEnabled ? {} : undefined,
                    maxRetriesPerRequest: 3,
                    retryStrategy: function (times) {
                        if (times > 5) {
                            _this.logger.warn("Redis connection retry limit reached (".concat(times, " attempts). Falling back to safe degraded mode."));
                            return null;
                        }
                        return Math.min(times * 200, 2000);
                    },
                    reconnectOnError: function (err) {
                        _this.logger.warn("Redis reconnect error: ".concat(err.message));
                        return true;
                    },
                });
                this.client.on('connect', function () {
                    _this.isConnected = true;
                    _this.logger.log("Successfully connected to Redis instance at ".concat(host, ":").concat(port, " [DB ").concat(db, "]"));
                });
                this.client.on('error', function (err) {
                    _this.isConnected = false;
                    _this.logger.error("Redis connection error: ".concat(err.message));
                });
                this.client.on('close', function () {
                    _this.isConnected = false;
                    _this.logger.warn('Redis connection closed.');
                });
            }
            catch (err) {
                this.logger.error("Failed to initialize Redis client: ".concat(err.message));
            }
        };
        RedisService_1.prototype.onModuleDestroy = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.client) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.client.quit()];
                        case 1:
                            _a.sent();
                            this.isConnected = false;
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        Object.defineProperty(RedisService_1.prototype, "isReady", {
            get: function () {
                return this.isConnected && this.client !== null;
            },
            enumerable: false,
            configurable: true
        });
        RedisService_1.prototype.getClient = function () {
            return this.client;
        };
        RedisService_1.prototype.get = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.isReady || !this.client)
                                return [2 /*return*/, null];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.client.get(key)];
                        case 2: return [2 /*return*/, _a.sent()];
                        case 3:
                            err_1 = _a.sent();
                            this.logger.warn("Redis GET failed for key \"".concat(key, "\": ").concat(err_1.message));
                            return [2 /*return*/, null];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        RedisService_1.prototype.set = function (key, value, ttlSeconds) {
            return __awaiter(this, void 0, void 0, function () {
                var err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.isReady || !this.client)
                                return [2 /*return*/];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 6, , 7]);
                            if (!(ttlSeconds && ttlSeconds > 0)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.client.set(key, value, 'EX', ttlSeconds)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.client.set(key, value)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            err_2 = _a.sent();
                            this.logger.warn("Redis SET failed for key \"".concat(key, "\": ").concat(err_2.message));
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        RedisService_1.prototype.del = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var err_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.isReady || !this.client)
                                return [2 /*return*/];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.client.del(key)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            err_3 = _a.sent();
                            this.logger.warn("Redis DEL failed for key \"".concat(key, "\": ").concat(err_3.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Sliding window / Token rate limiting with Redis multi-pipeline.
         * Atomically increments hits and enforces limits per IP or account identifier.
         */
        RedisService_1.prototype.checkRateLimit = function (identifier, limit, windowSeconds) {
            return __awaiter(this, void 0, void 0, function () {
                var key, multi, results, totalHits, ttl, allowed, remainingHits, err_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.isReady || !this.client) {
                                // In fail-safe mode if Redis is temporarily offline, allow request to prevent hard outage
                                return [2 /*return*/, { allowed: true, totalHits: 1, remainingHits: limit - 1, resetInSeconds: windowSeconds }];
                            }
                            key = "ratelimit:".concat(identifier);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 6]);
                            multi = this.client.multi();
                            multi.incr(key);
                            multi.ttl(key);
                            return [4 /*yield*/, multi.exec()];
                        case 2:
                            results = _a.sent();
                            if (!results || results.length < 2) {
                                return [2 /*return*/, { allowed: true, totalHits: 1, remainingHits: limit - 1, resetInSeconds: windowSeconds }];
                            }
                            totalHits = results[0][1] || 1;
                            ttl = results[1][1] || -1;
                            if (!(ttl === -1 || totalHits === 1)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.client.expire(key, windowSeconds)];
                        case 3:
                            _a.sent();
                            ttl = windowSeconds;
                            _a.label = 4;
                        case 4:
                            allowed = totalHits <= limit;
                            remainingHits = Math.max(0, limit - totalHits);
                            return [2 /*return*/, {
                                    allowed: allowed,
                                    totalHits: totalHits,
                                    remainingHits: remainingHits,
                                    resetInSeconds: ttl > 0 ? ttl : windowSeconds,
                                }];
                        case 5:
                            err_4 = _a.sent();
                            this.logger.warn("Rate limit check failed for ".concat(identifier, ": ").concat(err_4.message));
                            return [2 /*return*/, { allowed: true, totalHits: 1, remainingHits: limit - 1, resetInSeconds: windowSeconds }];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        return RedisService_1;
    }());
    __setFunctionName(_classThis, "RedisService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RedisService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RedisService = _classThis;
}();
exports.RedisService = RedisService;
