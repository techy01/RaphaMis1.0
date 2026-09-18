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
exports.CommunicationController = void 0;
var common_1 = require("@nestjs/common");
var CommunicationController = function () {
    var _classDecorators = [(0, common_1.Controller)('communication')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _sendMessage_decorators;
    var _getMessages_decorators;
    var _getStats_decorators;
    var _getTemplates_decorators;
    var _handleDeliveryWebhook_decorators;
    var _handleInboundReply_decorators;
    var _testGatewayConnection_decorators;
    var CommunicationController = _classThis = /** @class */ (function () {
        function CommunicationController_1(commService) {
            this.commService = (__runInitializers(this, _instanceExtraInitializers), commService);
        }
        CommunicationController_1.prototype.sendMessage = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.commService.sendMessage(dto)];
                });
            });
        };
        CommunicationController_1.prototype.getMessages = function (search, channel, status, category, patientId, limit, offset) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.commService.getMessages({ search: search, channel: channel, status: status, category: category, patientId: patientId, limit: limit, offset: offset })];
                });
            });
        };
        CommunicationController_1.prototype.getStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.commService.getStats()];
                });
            });
        };
        CommunicationController_1.prototype.getTemplates = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, [
                            {
                                id: 'tpl_appt_24h',
                                key: 'APPOINTMENT_REMINDER_24H',
                                name: '24-Hour Consultation Reminder',
                                channel: 'whatsapp',
                                category: 'APPOINTMENT_REMINDER',
                                content: 'Hello {{patientName}}, this is a reminder of your medical consultation tomorrow at {{appointmentTime}} with {{doctorName}} at {{hospitalName}}. Please reply 1 to Confirm or 2 to Reschedule.',
                                variables: ['patientName', 'appointmentTime', 'doctorName', 'hospitalName'],
                                isActive: true,
                                whatsappApproved: true,
                                description: 'Interactive reminder with automated 1/2 response handling.',
                            },
                            {
                                id: 'tpl_news2_stat',
                                key: 'NEWS2_EMERGENCY_ESCALATION',
                                name: 'Critical NEWS2 Triage Escalation',
                                channel: 'sms',
                                category: 'CRITICAL_NEWS2_ALERT',
                                content: 'CRITICAL STAT ALERT: Patient {{patientName}} (MRN: {{patientMrn}}) in {{wardBed}} has NEWS2 Score {{news2Score}} (High Risk). Immediate attending physician review required.',
                                variables: ['patientName', 'patientMrn', 'wardBed', 'news2Score'],
                                isActive: true,
                                whatsappApproved: false,
                                description: 'Dispatched to on-call physician and ward charge sister.',
                            },
                            {
                                id: 'tpl_rx_ready',
                                key: 'PRESCRIPTION_DISPENSED_PICKUP',
                                name: 'Pharmacy Medication Ready for Pickup',
                                channel: 'whatsapp',
                                category: 'PRESCRIPTION_READY',
                                content: 'Dear {{patientName}}, your medications prescribed by {{doctorName}} are ready for pickup at {{hospitalName}} Outpatient Pharmacy. Please present Locker Token Code: #{{pickupCode}}.',
                                variables: ['patientName', 'doctorName', 'hospitalName', 'pickupCode'],
                                isActive: true,
                                whatsappApproved: true,
                                description: 'Includes secure dispensing token and locker number.',
                            },
                            {
                                id: 'tpl_gatepass_code',
                                key: 'DISCHARGE_GATEPASS_SMS',
                                name: 'Discharge Gatepass & Settlement Code',
                                channel: 'sms',
                                category: 'DISCHARGE_GATEPASS',
                                content: 'RaphaMIS Security Clearance: Patient {{patientName}} has received clinical and financial discharge. Gatepass No: {{gatepassCode}}. Present this code at hospital security exit.',
                                variables: ['patientName', 'gatepassCode'],
                                isActive: true,
                                whatsappApproved: false,
                                description: 'Official digital exit pass code for security checkpoint.',
                            },
                            {
                                id: 'tpl_panic_lab',
                                key: 'LAB_PANIC_VALUE_DOCTOR',
                                name: 'Panic Lab Value Urgent Notification',
                                channel: 'sms',
                                category: 'LAB_PANIC_VALUE',
                                content: 'PANIC VALUE WARNING: Patient {{patientName}} (MRN: {{patientMrn}}) has abnormal diagnostic test {{testName}}: {{panicResult}} (Ref: {{referenceRange}}). Action required immediately.',
                                variables: ['patientName', 'patientMrn', 'testName', 'panicResult', 'referenceRange'],
                                isActive: true,
                                whatsappApproved: false,
                                description: 'Emergency notification dispatched to requesting doctor.',
                            },
                            {
                                id: 'tpl_telemed_link',
                                key: 'TELEMEDICINE_SESSION_INVITE',
                                name: 'Telemedicine Video Consultation Link',
                                channel: 'whatsapp',
                                category: 'TELEMEDICINE_INVITE',
                                content: 'Hello {{patientName}}, your encrypted video consultation with {{doctorName}} starts in 15 minutes. Join via your secure patient portal link: {{sessionUrl}}.',
                                variables: ['patientName', 'doctorName', 'sessionUrl'],
                                isActive: true,
                                whatsappApproved: true,
                                description: 'Secure WebRTC consultation room link.',
                            },
                        ]];
                });
            });
        };
        CommunicationController_1.prototype.handleDeliveryWebhook = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var providerMessageId, rawStatus, status;
                return __generator(this, function (_a) {
                    providerMessageId = body.id || body.MessageSid || body.messageId;
                    rawStatus = (body.status || body.MessageStatus || '').toUpperCase();
                    status = 'DELIVERED';
                    if (rawStatus === 'READ')
                        status = 'READ';
                    if (rawStatus === 'FAILED' || rawStatus === 'UNDELIVERED')
                        status = 'FAILED';
                    return [2 /*return*/, this.commService.handleDeliveryStatusWebhook(providerMessageId, status, body.description || body.ErrorMessage)];
                });
            });
        };
        CommunicationController_1.prototype.handleInboundReply = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var fromPhone, text;
                return __generator(this, function (_a) {
                    fromPhone = body.from || body.From || body.sender;
                    text = body.text || body.Body || body.message || '';
                    return [2 /*return*/, this.commService.handleInboundReplyWebhook(fromPhone, text)];
                });
            });
        };
        CommunicationController_1.prototype.testGatewayConnection = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var testPhone, provider;
                return __generator(this, function (_a) {
                    testPhone = body.recipientPhone || '+254700000000';
                    provider = body.provider || 'AfricasTalking';
                    return [2 /*return*/, this.commService.sendMessage({
                            recipientPhone: testPhone,
                            channel: provider === 'WhatsAppCloud' ? 'whatsapp' : 'sms',
                            provider: provider,
                            category: 'GENERAL_BROADCAST',
                            messageBody: "[RaphaMIS Test Ping] Telephony Gateway (".concat(provider, ") verified successfully at ").concat(new Date().toISOString(), "."),
                        })];
                });
            });
        };
        return CommunicationController_1;
    }());
    __setFunctionName(_classThis, "CommunicationController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _sendMessage_decorators = [(0, common_1.Post)('send')];
        _getMessages_decorators = [(0, common_1.Get)('messages')];
        _getStats_decorators = [(0, common_1.Get)('stats')];
        _getTemplates_decorators = [(0, common_1.Get)('templates')];
        _handleDeliveryWebhook_decorators = [(0, common_1.Post)('webhook/status'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _handleInboundReply_decorators = [(0, common_1.Post)('webhook/inbound'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _testGatewayConnection_decorators = [(0, common_1.Post)('test-gateway')];
        __esDecorate(_classThis, null, _sendMessage_decorators, { kind: "method", name: "sendMessage", static: false, private: false, access: { has: function (obj) { return "sendMessage" in obj; }, get: function (obj) { return obj.sendMessage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMessages_decorators, { kind: "method", name: "getMessages", static: false, private: false, access: { has: function (obj) { return "getMessages" in obj; }, get: function (obj) { return obj.getMessages; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: function (obj) { return "getStats" in obj; }, get: function (obj) { return obj.getStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTemplates_decorators, { kind: "method", name: "getTemplates", static: false, private: false, access: { has: function (obj) { return "getTemplates" in obj; }, get: function (obj) { return obj.getTemplates; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleDeliveryWebhook_decorators, { kind: "method", name: "handleDeliveryWebhook", static: false, private: false, access: { has: function (obj) { return "handleDeliveryWebhook" in obj; }, get: function (obj) { return obj.handleDeliveryWebhook; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleInboundReply_decorators, { kind: "method", name: "handleInboundReply", static: false, private: false, access: { has: function (obj) { return "handleInboundReply" in obj; }, get: function (obj) { return obj.handleInboundReply; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _testGatewayConnection_decorators, { kind: "method", name: "testGatewayConnection", static: false, private: false, access: { has: function (obj) { return "testGatewayConnection" in obj; }, get: function (obj) { return obj.testGatewayConnection; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CommunicationController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CommunicationController = _classThis;
}();
exports.CommunicationController = CommunicationController;
