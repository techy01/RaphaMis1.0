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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacsServerEntity = void 0;
var typeorm_1 = require("typeorm");
var PacsServerEntity = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('pacs_servers')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _aeTitle_decorators;
    var _aeTitle_initializers = [];
    var _aeTitle_extraInitializers = [];
    var _host_decorators;
    var _host_initializers = [];
    var _host_extraInitializers = [];
    var _port_decorators;
    var _port_initializers = [];
    var _port_extraInitializers = [];
    var _dicomwebUrl_decorators;
    var _dicomwebUrl_initializers = [];
    var _dicomwebUrl_extraInitializers = [];
    var _username_decorators;
    var _username_initializers = [];
    var _username_extraInitializers = [];
    var _password_decorators;
    var _password_initializers = [];
    var _password_extraInitializers = [];
    var _isDefault_decorators;
    var _isDefault_initializers = [];
    var _isDefault_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _lastEchoTime_decorators;
    var _lastEchoTime_initializers = [];
    var _lastEchoTime_extraInitializers = [];
    var _lastLatencyMs_decorators;
    var _lastLatencyMs_initializers = [];
    var _lastLatencyMs_extraInitializers = [];
    var _tenantId_decorators;
    var _tenantId_initializers = [];
    var _tenantId_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var PacsServerEntity = _classThis = /** @class */ (function () {
        function PacsServerEntity_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.type = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            this.aeTitle = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _aeTitle_initializers, void 0));
            this.host = (__runInitializers(this, _aeTitle_extraInitializers), __runInitializers(this, _host_initializers, void 0));
            this.port = (__runInitializers(this, _host_extraInitializers), __runInitializers(this, _port_initializers, void 0));
            this.dicomwebUrl = (__runInitializers(this, _port_extraInitializers), __runInitializers(this, _dicomwebUrl_initializers, void 0));
            this.username = (__runInitializers(this, _dicomwebUrl_extraInitializers), __runInitializers(this, _username_initializers, void 0));
            this.password = (__runInitializers(this, _username_extraInitializers), __runInitializers(this, _password_initializers, void 0));
            this.isDefault = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _isDefault_initializers, void 0));
            this.status = (__runInitializers(this, _isDefault_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.lastEchoTime = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _lastEchoTime_initializers, void 0));
            this.lastLatencyMs = (__runInitializers(this, _lastEchoTime_extraInitializers), __runInitializers(this, _lastLatencyMs_initializers, void 0));
            this.tenantId = (__runInitializers(this, _lastLatencyMs_extraInitializers), __runInitializers(this, _tenantId_initializers, void 0));
            this.createdAt = (__runInitializers(this, _tenantId_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
        return PacsServerEntity_1;
    }());
    __setFunctionName(_classThis, "PacsServerEntity");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _name_decorators = [(0, typeorm_1.Column)({ name: 'name' })];
        _type_decorators = [(0, typeorm_1.Column)({ name: 'type', default: 'ORTHANC' })];
        _aeTitle_decorators = [(0, typeorm_1.Column)({ name: 'ae_title', default: 'RAPHA_PACS' })];
        _host_decorators = [(0, typeorm_1.Column)({ name: 'host', default: '127.0.0.1' })];
        _port_decorators = [(0, typeorm_1.Column)({ name: 'port', default: 4242 })];
        _dicomwebUrl_decorators = [(0, typeorm_1.Column)({ name: 'dicomweb_url', nullable: true })];
        _username_decorators = [(0, typeorm_1.Column)({ name: 'username', nullable: true })];
        _password_decorators = [(0, typeorm_1.Column)({ name: 'password', nullable: true })];
        _isDefault_decorators = [(0, typeorm_1.Column)({ name: 'is_default', default: false })];
        _status_decorators = [(0, typeorm_1.Column)({ name: 'status', default: 'ONLINE' })];
        _lastEchoTime_decorators = [(0, typeorm_1.Column)({ name: 'last_echo_time', nullable: true })];
        _lastLatencyMs_decorators = [(0, typeorm_1.Column)({ name: 'last_latency_ms', nullable: true })];
        _tenantId_decorators = [(0, typeorm_1.Column)({ name: 'tenant_id', default: 'tenant_001' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _aeTitle_decorators, { kind: "field", name: "aeTitle", static: false, private: false, access: { has: function (obj) { return "aeTitle" in obj; }, get: function (obj) { return obj.aeTitle; }, set: function (obj, value) { obj.aeTitle = value; } }, metadata: _metadata }, _aeTitle_initializers, _aeTitle_extraInitializers);
        __esDecorate(null, null, _host_decorators, { kind: "field", name: "host", static: false, private: false, access: { has: function (obj) { return "host" in obj; }, get: function (obj) { return obj.host; }, set: function (obj, value) { obj.host = value; } }, metadata: _metadata }, _host_initializers, _host_extraInitializers);
        __esDecorate(null, null, _port_decorators, { kind: "field", name: "port", static: false, private: false, access: { has: function (obj) { return "port" in obj; }, get: function (obj) { return obj.port; }, set: function (obj, value) { obj.port = value; } }, metadata: _metadata }, _port_initializers, _port_extraInitializers);
        __esDecorate(null, null, _dicomwebUrl_decorators, { kind: "field", name: "dicomwebUrl", static: false, private: false, access: { has: function (obj) { return "dicomwebUrl" in obj; }, get: function (obj) { return obj.dicomwebUrl; }, set: function (obj, value) { obj.dicomwebUrl = value; } }, metadata: _metadata }, _dicomwebUrl_initializers, _dicomwebUrl_extraInitializers);
        __esDecorate(null, null, _username_decorators, { kind: "field", name: "username", static: false, private: false, access: { has: function (obj) { return "username" in obj; }, get: function (obj) { return obj.username; }, set: function (obj, value) { obj.username = value; } }, metadata: _metadata }, _username_initializers, _username_extraInitializers);
        __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: function (obj) { return "password" in obj; }, get: function (obj) { return obj.password; }, set: function (obj, value) { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
        __esDecorate(null, null, _isDefault_decorators, { kind: "field", name: "isDefault", static: false, private: false, access: { has: function (obj) { return "isDefault" in obj; }, get: function (obj) { return obj.isDefault; }, set: function (obj, value) { obj.isDefault = value; } }, metadata: _metadata }, _isDefault_initializers, _isDefault_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _lastEchoTime_decorators, { kind: "field", name: "lastEchoTime", static: false, private: false, access: { has: function (obj) { return "lastEchoTime" in obj; }, get: function (obj) { return obj.lastEchoTime; }, set: function (obj, value) { obj.lastEchoTime = value; } }, metadata: _metadata }, _lastEchoTime_initializers, _lastEchoTime_extraInitializers);
        __esDecorate(null, null, _lastLatencyMs_decorators, { kind: "field", name: "lastLatencyMs", static: false, private: false, access: { has: function (obj) { return "lastLatencyMs" in obj; }, get: function (obj) { return obj.lastLatencyMs; }, set: function (obj, value) { obj.lastLatencyMs = value; } }, metadata: _metadata }, _lastLatencyMs_initializers, _lastLatencyMs_extraInitializers);
        __esDecorate(null, null, _tenantId_decorators, { kind: "field", name: "tenantId", static: false, private: false, access: { has: function (obj) { return "tenantId" in obj; }, get: function (obj) { return obj.tenantId; }, set: function (obj, value) { obj.tenantId = value; } }, metadata: _metadata }, _tenantId_initializers, _tenantId_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PacsServerEntity = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PacsServerEntity = _classThis;
}();
exports.PacsServerEntity = PacsServerEntity;
