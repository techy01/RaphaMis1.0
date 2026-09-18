"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.PatientsService = void 0;
var common_1 = require("@nestjs/common");
var clinical_decision_support_1 = require("./clinical-decision-support");
var PatientsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PatientsService = _classThis = /** @class */ (function () {
        function PatientsService_1(patientsRepository) {
            this.patientsRepository = patientsRepository;
        }
        PatientsService_1.prototype.findAll = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var query;
                return __generator(this, function (_a) {
                    query = this.patientsRepository.createQueryBuilder('patient');
                    if (tenantId) {
                        query.where('patient.tenantId = :tenantId', { tenantId: tenantId });
                    }
                    query.orderBy('patient.createdAt', 'DESC');
                    return [2 /*return*/, query.getMany()];
                });
            });
        };
        PatientsService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var patient;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.patientsRepository.findOne({ where: { id: id } })];
                        case 1:
                            patient = _a.sent();
                            if (!patient) {
                                throw new common_1.NotFoundException("Patient with ID \"".concat(id, "\" not found"));
                            }
                            return [2 /*return*/, patient];
                    }
                });
            });
        };
        PatientsService_1.prototype.create = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var fullName, mrn, patient;
                return __generator(this, function (_a) {
                    fullName = "".concat(data.firstName || '', " ").concat(data.lastName || '').trim() || data.name || 'Patient';
                    mrn = data.mrn || "MRN-".concat(Math.floor(10000 + Math.random() * 90000));
                    patient = this.patientsRepository.create(__assign(__assign({}, data), { name: fullName, mrn: mrn }));
                    return [2 /*return*/, this.patientsRepository.save(patient)];
                });
            });
        };
        PatientsService_1.prototype.update = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                var patient, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            patient = _a.sent();
                            updated = Object.assign(patient, data);
                            return [2 /*return*/, this.patientsRepository.save(updated)];
                    }
                });
            });
        };
        PatientsService_1.prototype.updateVitals = function (id, vitals) {
            return __awaiter(this, void 0, void 0, function () {
                var patient, bp, systolicBp, respiratoryRate, oxygenSaturation, heartRate, temperature, consciousness, onSupplementalOxygen, news2, enrichedVitals;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            patient = _a.sent();
                            bp = (0, clinical_decision_support_1.parseBloodPressure)(vitals.bloodPressure || '120/80');
                            systolicBp = Number(vitals.systolicBp || bp.systolic || 120);
                            respiratoryRate = Number(vitals.respiratoryRate || 16);
                            oxygenSaturation = Number(vitals.oxygenSaturation || 98);
                            heartRate = Number(vitals.heartRate || 72);
                            temperature = Number(vitals.temperature || 37.0);
                            consciousness = vitals.consciousness || 'Alert';
                            onSupplementalOxygen = Boolean(vitals.onSupplementalOxygen);
                            news2 = (0, clinical_decision_support_1.calculateNEWS2)({
                                respiratoryRate: respiratoryRate,
                                oxygenSaturation: oxygenSaturation,
                                onSupplementalOxygen: onSupplementalOxygen,
                                systolicBp: systolicBp,
                                heartRate: heartRate,
                                temperature: temperature,
                                consciousness: consciousness,
                                isHypercapnicRespiratoryFailure: Boolean(vitals.isHypercapnicRespiratoryFailure),
                            });
                            enrichedVitals = __assign(__assign({}, vitals), { systolicBp: systolicBp, diastolicBp: bp.diastolic, consciousness: consciousness, onSupplementalOxygen: onSupplementalOxygen, news2Score: news2.totalScore, news2RiskLevel: news2.riskLevel, news2ClinicalAction: news2.clinicalAction, news2MonitoringFrequency: news2.monitoringFrequency, recordedAt: vitals.recordedAt || new Date().toISOString() });
                            patient.vitals = enrichedVitals;
                            // Automatic clinical escalation if High Risk (NEWS2 >= 7) and currently routine
                            if (news2.totalScore >= 7 && patient.status !== 'Critical') {
                                patient.status = 'Critical';
                            }
                            return [2 /*return*/, this.patientsRepository.save(patient)];
                    }
                });
            });
        };
        PatientsService_1.prototype.evaluatePrescription = function (id, proposedMedication) {
            return __awaiter(this, void 0, void 0, function () {
                var patient, activePrescriptions, patientAllergies, alerts;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            patient = _a.sent();
                            activePrescriptions = Array.isArray(patient.prescriptions)
                                ? patient.prescriptions
                                : [];
                            patientAllergies = Array.isArray(patient.allergies) ? patient.allergies : [];
                            alerts = (0, clinical_decision_support_1.evaluatePrescriptionSafety)(proposedMedication, activePrescriptions, patientAllergies);
                            return [2 /*return*/, {
                                    proposedMedication: proposedMedication,
                                    alerts: alerts,
                                    hasSevereAlerts: alerts.some(function (a) { return a.requiresOverride; }),
                                    patientAllergies: patientAllergies,
                                }];
                    }
                });
            });
        };
        PatientsService_1.prototype.addNote = function (id, note) {
            return __awaiter(this, void 0, void 0, function () {
                var patient, notes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            patient = _a.sent();
                            notes = Array.isArray(patient.notes) ? patient.notes : [];
                            notes.unshift(__assign({ id: "nt_".concat(Date.now()), createdAt: new Date().toISOString() }, note));
                            patient.notes = notes;
                            return [2 /*return*/, this.patientsRepository.save(patient)];
                    }
                });
            });
        };
        PatientsService_1.prototype.addPrescription = function (id, prescription) {
            return __awaiter(this, void 0, void 0, function () {
                var patient, prescriptions, patientAllergies, safetyAlerts, hasSevereAlert;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            patient = _b.sent();
                            prescriptions = Array.isArray(patient.prescriptions) ? patient.prescriptions : [];
                            patientAllergies = Array.isArray(patient.allergies) ? patient.allergies : [];
                            safetyAlerts = (0, clinical_decision_support_1.evaluatePrescriptionSafety)(prescription.medication, prescriptions, patientAllergies);
                            hasSevereAlert = safetyAlerts.some(function (a) { return a.requiresOverride; });
                            // Enforce clinical override justification for severe contraindicated interactions or allergy conflicts
                            if (hasSevereAlert && !((_a = prescription.clinicalOverrideReason) === null || _a === void 0 ? void 0 : _a.trim())) {
                                throw new common_1.BadRequestException({
                                    message: 'Prescription blocked by Patient Safety Engine: High-risk drug interaction or allergy conflict detected. A clinical override justification is required.',
                                    safetyAlerts: safetyAlerts,
                                });
                            }
                            prescriptions.unshift(__assign(__assign({ id: "rx_".concat(Date.now()), createdAt: new Date().toISOString() }, prescription), { safetyAlerts: safetyAlerts.map(function (a) { return "".concat(a.title, ": ").concat(a.clinicalEffect); }), interactionWarningAcknowledged: Boolean(prescription.clinicalOverrideReason) }));
                            patient.prescriptions = prescriptions;
                            return [2 /*return*/, this.patientsRepository.save(patient)];
                    }
                });
            });
        };
        PatientsService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.patientsRepository.delete(id)];
                        case 1:
                            result = _a.sent();
                            if (result.affected === 0) {
                                throw new common_1.NotFoundException("Patient with ID \"".concat(id, "\" not found"));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        PatientsService_1.prototype.count = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.patientsRepository.count()];
                });
            });
        };
        PatientsService_1.prototype.getStats = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var totalPatients, admittedPatients, dischargedPatients, criticalPatients, activePatients;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.patientsRepository.count(tenantId ? { where: { tenantId: tenantId } } : {})];
                        case 1:
                            totalPatients = _a.sent();
                            return [4 /*yield*/, this.patientsRepository.count({
                                    where: tenantId ? { tenantId: tenantId, status: 'Admitted' } : { status: 'Admitted' },
                                })];
                        case 2:
                            admittedPatients = _a.sent();
                            return [4 /*yield*/, this.patientsRepository.count({
                                    where: tenantId ? { tenantId: tenantId, status: 'Discharged' } : { status: 'Discharged' },
                                })];
                        case 3:
                            dischargedPatients = _a.sent();
                            return [4 /*yield*/, this.patientsRepository.count({
                                    where: tenantId ? { tenantId: tenantId, status: 'Critical' } : { status: 'Critical' },
                                })];
                        case 4:
                            criticalPatients = _a.sent();
                            activePatients = Math.max(0, totalPatients - dischargedPatients);
                            return [2 /*return*/, {
                                    totalPatients: totalPatients,
                                    activePatients: activePatients,
                                    admittedPatients: admittedPatients,
                                    dischargedPatients: dischargedPatients,
                                    criticalPatients: criticalPatients,
                                }];
                    }
                });
            });
        };
        return PatientsService_1;
    }());
    __setFunctionName(_classThis, "PatientsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PatientsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PatientsService = _classThis;
}();
exports.PatientsService = PatientsService;
