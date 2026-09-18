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
exports.Invoice = exports.InvoiceStatus = void 0;
var typeorm_1 = require("typeorm");
var tenant_entity_1 = require("../tenants/tenant.entity");
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["Paid"] = "Paid";
    InvoiceStatus["Pending"] = "Pending";
    InvoiceStatus["Overdue"] = "Overdue";
    InvoiceStatus["Cancelled"] = "Cancelled";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var Invoice = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('invoices')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _amount_decorators;
    var _amount_initializers = [];
    var _amount_extraInitializers = [];
    var _dueDate_decorators;
    var _dueDate_initializers = [];
    var _dueDate_extraInitializers = [];
    var _paidDate_decorators;
    var _paidDate_initializers = [];
    var _paidDate_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _tenant_decorators;
    var _tenant_initializers = [];
    var _tenant_extraInitializers = [];
    var _tenantId_decorators;
    var _tenantId_initializers = [];
    var _tenantId_extraInitializers = [];
    var Invoice = _classThis = /** @class */ (function () {
        function Invoice_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.amount = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
            this.dueDate = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _dueDate_initializers, void 0));
            this.paidDate = (__runInitializers(this, _dueDate_extraInitializers), __runInitializers(this, _paidDate_initializers, void 0));
            this.status = (__runInitializers(this, _paidDate_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.createdAt = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.tenant = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _tenant_initializers, void 0));
            this.tenantId = (__runInitializers(this, _tenant_extraInitializers), __runInitializers(this, _tenantId_initializers, void 0));
            __runInitializers(this, _tenantId_extraInitializers);
        }
        return Invoice_1;
    }());
    __setFunctionName(_classThis, "Invoice");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _amount_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 })];
        _dueDate_decorators = [(0, typeorm_1.Column)({ name: 'due_date', type: 'date' })];
        _paidDate_decorators = [(0, typeorm_1.Column)({ name: 'paid_date', type: 'date', nullable: true })];
        _status_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: InvoiceStatus,
                default: InvoiceStatus.Pending,
            })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' })];
        _tenant_decorators = [(0, typeorm_1.ManyToOne)(function () { return tenant_entity_1.Tenant; }, function (tenant) { return tenant.invoices; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'tenant_id' })];
        _tenantId_decorators = [(0, typeorm_1.Column)({ name: 'tenant_id' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: function (obj) { return "amount" in obj; }, get: function (obj) { return obj.amount; }, set: function (obj, value) { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
        __esDecorate(null, null, _dueDate_decorators, { kind: "field", name: "dueDate", static: false, private: false, access: { has: function (obj) { return "dueDate" in obj; }, get: function (obj) { return obj.dueDate; }, set: function (obj, value) { obj.dueDate = value; } }, metadata: _metadata }, _dueDate_initializers, _dueDate_extraInitializers);
        __esDecorate(null, null, _paidDate_decorators, { kind: "field", name: "paidDate", static: false, private: false, access: { has: function (obj) { return "paidDate" in obj; }, get: function (obj) { return obj.paidDate; }, set: function (obj, value) { obj.paidDate = value; } }, metadata: _metadata }, _paidDate_initializers, _paidDate_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _tenant_decorators, { kind: "field", name: "tenant", static: false, private: false, access: { has: function (obj) { return "tenant" in obj; }, get: function (obj) { return obj.tenant; }, set: function (obj, value) { obj.tenant = value; } }, metadata: _metadata }, _tenant_initializers, _tenant_extraInitializers);
        __esDecorate(null, null, _tenantId_decorators, { kind: "field", name: "tenantId", static: false, private: false, access: { has: function (obj) { return "tenantId" in obj; }, get: function (obj) { return obj.tenantId; }, set: function (obj, value) { obj.tenantId = value; } }, metadata: _metadata }, _tenantId_initializers, _tenantId_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Invoice = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Invoice = _classThis;
}();
exports.Invoice = Invoice;
