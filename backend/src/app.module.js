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
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var typeorm_1 = require("@nestjs/typeorm");
var core_1 = require("@nestjs/core");
var users_module_1 = require("./users/users.module");
var auth_module_1 = require("./auth/auth.module");
var tenants_module_1 = require("./tenants/tenants.module");
var dashboard_module_1 = require("./dashboard/dashboard.module");
var billing_module_1 = require("./billing/billing.module");
var audit_module_1 = require("./audit/audit.module");
var mail_module_1 = require("./mail/mail.module");
var redis_module_1 = require("./redis/redis.module");
var redis_rate_limit_guard_1 = require("./common/guards/redis-rate-limit.guard");
var patients_module_1 = require("./patients/patients.module");
var communication_module_1 = require("./communication/communication.module");
var pacs_module_1 = require("./pacs/pacs.module");
var user_entity_1 = require("./users/user.entity");
var tenant_entity_1 = require("./tenants/tenant.entity");
var invoice_entity_1 = require("./billing/invoice.entity");
var audit_log_entity_1 = require("./audit/audit-log.entity");
var patient_entity_1 = require("./patients/patient.entity");
var communication_message_entity_1 = require("./communication/communication-message.entity");
var pacs_study_entity_1 = require("./pacs/pacs-study.entity");
var pacs_server_entity_1 = require("./pacs/pacs-server.entity");
var AppModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                // Centralized environment configuration
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: ['.env', '../.env'],
                }),
                // Distributed in-memory state & rate limiting via Redis
                redis_module_1.RedisModule,
                // Database connection supporting MySQL and PostgreSQL from .env
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: function (configService) {
                        var rawDbType = (configService.get('DB_TYPE', 'mysql')).toLowerCase().trim();
                        var isMySql = rawDbType === 'mysql' || rawDbType === 'mariadb';
                        return {
                            type: isMySql ? 'mysql' : 'postgres',
                            host: configService.get('DB_HOST', '127.0.0.1'),
                            port: Number(configService.get('DB_PORT', isMySql ? 3306 : 5432)),
                            username: configService.get('DB_USERNAME', 'raphamis_user'),
                            password: configService.get('DB_PASSWORD', ''),
                            database: configService.get('DB_DATABASE', 'raphamis_db'),
                            entities: [user_entity_1.User, tenant_entity_1.Tenant, invoice_entity_1.Invoice, audit_log_entity_1.AuditLog, patient_entity_1.Patient, communication_message_entity_1.CommunicationMessage, pacs_study_entity_1.PacsStudyEntity, pacs_server_entity_1.PacsServerEntity],
                            // Enforce synchronize=false in production to prevent unintended DDL schema migrations
                            synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
                            logging: configService.get('DB_LOGGING', 'false') === 'true',
                            charset: isMySql ? 'utf8mb4_unicode_ci' : undefined,
                            timezone: configService.get('DB_TIMEZONE', 'Z'),
                            extra: isMySql
                                ? {
                                    connectionLimit: Number(configService.get('DB_POOL_MAX', 15)),
                                    connectTimeout: Number(configService.get('DB_CONNECT_TIMEOUT', 10000)),
                                }
                                : undefined,
                            ssl: configService.get('DB_SSL', 'false') === 'true'
                                ? {
                                    rejectUnauthorized: configService.get('DB_SSL_REJECT_UNAUTHORIZED', 'true') === 'true',
                                }
                                : false,
                        };
                    },
                }),
                users_module_1.UsersModule,
                auth_module_1.AuthModule,
                tenants_module_1.TenantsModule,
                dashboard_module_1.DashboardModule,
                billing_module_1.BillingModule,
                audit_module_1.AuditModule,
                mail_module_1.MailModule,
                patients_module_1.PatientsModule,
                communication_module_1.CommunicationModule,
                pacs_module_1.PacsModule,
            ],
            controllers: [],
            providers: [
                // Global rate-limiting guard using Redis sliding window
                {
                    provide: core_1.APP_GUARD,
                    useClass: redis_rate_limit_guard_1.RedisRateLimitGuard,
                },
            ],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppModule = _classThis = /** @class */ (function () {
        function AppModule_1() {
        }
        return AppModule_1;
    }());
    __setFunctionName(_classThis, "AppModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
}();
exports.AppModule = AppModule;
