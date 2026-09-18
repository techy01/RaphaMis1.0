"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
exports.PacsController = void 0;
var common_1 = require("@nestjs/common");
var PacsController = function () {
    var _classDecorators = [(0, common_1.Controller)('pacs')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getStudies_decorators;
    var _getStudyByUid_decorators;
    var _getServers_decorators;
    var _upsertServer_decorators;
    var _echoServer_decorators;
    var _uploadDicomInstance_decorators;
    var _exportStudy_decorators;
    var PacsController = _classThis = /** @class */ (function () {
        function PacsController_1(pacsService) {
            this.pacsService = (__runInitializers(this, _instanceExtraInitializers), pacsService);
        }
        PacsController_1.prototype.getStudies = function (tenantId, search, modality, patientMRN, accessionNumber) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.pacsService.getStudies({
                            tenantId: tenantId,
                            search: search,
                            modality: modality,
                            patientMRN: patientMRN,
                            accessionNumber: accessionNumber,
                        })];
                });
            });
        };
        PacsController_1.prototype.getStudyByUid = function (studyInstanceUid) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.pacsService.getStudyByUid(studyInstanceUid)];
                });
            });
        };
        PacsController_1.prototype.getServers = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.pacsService.getServers(tenantId)];
                });
            });
        };
        PacsController_1.prototype.upsertServer = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.pacsService.upsertServer(dto)];
                });
            });
        };
        PacsController_1.prototype.echoServer = function (serverId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.pacsService.echoServer(serverId)];
                });
            });
        };
        PacsController_1.prototype.uploadDicomInstance = function (payload) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.pacsService.ingestDicomInstance(payload)];
                });
            });
        };
        PacsController_1.prototype.exportStudy = function (studyInstanceUid, options) {
            return __awaiter(this, void 0, void 0, function () {
                var study;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.pacsService.getStudyByUid(studyInstanceUid)];
                        case 1:
                            study = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    studyInstanceUid: studyInstanceUid,
                                    anonymized: Boolean(options === null || options === void 0 ? void 0 : options.anonymize),
                                    downloadUrl: "/api/pacs/downloads/".concat(studyInstanceUid, ".zip"),
                                    expiresIn: '24 hours',
                                    study: study,
                                }];
                    }
                });
            });
        };
        return PacsController_1;
    }());
    __setFunctionName(_classThis, "PacsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getStudies_decorators = [(0, common_1.Get)('studies')];
        _getStudyByUid_decorators = [(0, common_1.Get)('studies/:studyInstanceUid')];
        _getServers_decorators = [(0, common_1.Get)('servers')];
        _upsertServer_decorators = [(0, common_1.Post)('servers')];
        _echoServer_decorators = [(0, common_1.Post)('servers/:id/echo')];
        _uploadDicomInstance_decorators = [(0, common_1.Post)('upload')];
        _exportStudy_decorators = [(0, common_1.Post)('studies/:studyInstanceUid/export')];
        __esDecorate(_classThis, null, _getStudies_decorators, { kind: "method", name: "getStudies", static: false, private: false, access: { has: function (obj) { return "getStudies" in obj; }, get: function (obj) { return obj.getStudies; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStudyByUid_decorators, { kind: "method", name: "getStudyByUid", static: false, private: false, access: { has: function (obj) { return "getStudyByUid" in obj; }, get: function (obj) { return obj.getStudyByUid; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getServers_decorators, { kind: "method", name: "getServers", static: false, private: false, access: { has: function (obj) { return "getServers" in obj; }, get: function (obj) { return obj.getServers; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _upsertServer_decorators, { kind: "method", name: "upsertServer", static: false, private: false, access: { has: function (obj) { return "upsertServer" in obj; }, get: function (obj) { return obj.upsertServer; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _echoServer_decorators, { kind: "method", name: "echoServer", static: false, private: false, access: { has: function (obj) { return "echoServer" in obj; }, get: function (obj) { return obj.echoServer; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _uploadDicomInstance_decorators, { kind: "method", name: "uploadDicomInstance", static: false, private: false, access: { has: function (obj) { return "uploadDicomInstance" in obj; }, get: function (obj) { return obj.uploadDicomInstance; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exportStudy_decorators, { kind: "method", name: "exportStudy", static: false, private: false, access: { has: function (obj) { return "exportStudy" in obj; }, get: function (obj) { return obj.exportStudy; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PacsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PacsController = _classThis;
}();
exports.PacsController = PacsController;
