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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
var roles_guard_1 = require("../auth/roles.guard");
var roles_decorator_1 = require("../auth/roles.decorator");
var user_entity_1 = require("../users/user.entity");
var BillingController = function () {
    var _classDecorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(user_entity_1.UserRoleEnum.Superadmin, user_entity_1.UserRoleEnum.Admin), (0, common_1.Controller)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAllBillingInvoices_decorators;
    var _findAllInvoices_decorators;
    var _findInvoicesForTenant_decorators;
    var _generateInvoices_decorators;
    var BillingController = _classThis = /** @class */ (function () {
        function BillingController_1(billingService) {
            this.billingService = (__runInitializers(this, _instanceExtraInitializers), billingService);
        }
        BillingController_1.prototype.findAllBillingInvoices = function () {
            return this.billingService.findAllInvoices();
        };
        BillingController_1.prototype.findAllInvoices = function () {
            return this.billingService.findAllInvoices();
        };
        BillingController_1.prototype.findInvoicesForTenant = function (tenantId) {
            return this.billingService.findInvoicesForTenant(tenantId);
        };
        BillingController_1.prototype.generateInvoices = function () {
            // Scheduled or manual invoice generation
            return this.billingService.generateMonthlyInvoices();
        };
        return BillingController_1;
    }());
    __setFunctionName(_classThis, "BillingController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAllBillingInvoices_decorators = [(0, common_1.Get)('billing/invoices')];
        _findAllInvoices_decorators = [(0, common_1.Get)('invoices')];
        _findInvoicesForTenant_decorators = [(0, common_1.Get)('billing/invoices/tenant/:tenantId')];
        _generateInvoices_decorators = [(0, common_1.Post)('billing/invoices/generate')];
        __esDecorate(_classThis, null, _findAllBillingInvoices_decorators, { kind: "method", name: "findAllBillingInvoices", static: false, private: false, access: { has: function (obj) { return "findAllBillingInvoices" in obj; }, get: function (obj) { return obj.findAllBillingInvoices; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAllInvoices_decorators, { kind: "method", name: "findAllInvoices", static: false, private: false, access: { has: function (obj) { return "findAllInvoices" in obj; }, get: function (obj) { return obj.findAllInvoices; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findInvoicesForTenant_decorators, { kind: "method", name: "findInvoicesForTenant", static: false, private: false, access: { has: function (obj) { return "findInvoicesForTenant" in obj; }, get: function (obj) { return obj.findInvoicesForTenant; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generateInvoices_decorators, { kind: "method", name: "generateInvoices", static: false, private: false, access: { has: function (obj) { return "generateInvoices" in obj; }, get: function (obj) { return obj.generateInvoices; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BillingController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BillingController = _classThis;
}();
exports.BillingController = BillingController;
