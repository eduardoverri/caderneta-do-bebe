import { Injectable, computed, signal } from '@angular/core';

export interface PediatricianInfo {
  name: string;
  crm: string;
  emergencyPhone: string;
}

export interface ActiveMedication {
  name: string;
  dose: string;
  frequency: string;
  isContinuous: boolean;
}

export interface GrowthLog {
  id?: string;
  measuredAt: string;
  ageDays?: number;
  correctedGestationalWeeks?: number;
  weightGrams: number;
  heightCm: number;
  measuredPosition?: string;
  adjustedHeightCm?: number;
  headCircumferenceCm: number;
  bmi?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodPressureObservations?: string;
  zScoreWeightForAge: number;
  zScoreHeightForAge?: number;
  zScoreHeadCircumference?: number;
  zScoreBmiForAge?: number;
  classificationWeight?: string;
  classificationHeight?: string;
  classificationHeadCircumference?: string;
  classificationBmi?: string;
  notes?: string;
}

export interface VaccineRecord {
  code: string;
  name: string;
  doseLabel?: string;
  ageGroupSection?: string;
  recommendedMonth: number;
  diseasesPrevented?: string;
  status: 'Pending' | 'Applied' | 'Overdue';
  appliedAt?: string;
  lot?: string;
  laboratory?: string;
  healthUnit?: string;
  signature?: string;
}

export interface ChildIdentification {
  photoUrl: string;
  birthMunicipality: string;
  motherName: string;
  fatherName: string;
  guardianName: string;
  ethnicity: string;
  raceColor: string;
  address: string;
  referencePoint: string;
  phone: string;
  cep: string;
  neighborhood: string;
  city: string;
  state: string;
  ubsName: string;
  dseiPoloBase: string;
  cnsNumber: string;
  dnvNumber: string;
  birthCertificateNumber: string;
  cpf: string;
}

export interface AddressChangeRecord {
  id: string;
  recordedAt: string;
  address: string;
  referencePoint: string;
  phone: string;
  cep: string;
  neighborhood: string;
  city: string;
  state: string;
  ubsName: string;
}

export interface SocialAssistanceRecord {
  childNis: string;
  guardianNis: string;
  crasName: string;
  crasPhone: string;
  crasAddress: string;
  bolsaFamiliaEnrolled: boolean;
  bolsaFamiliaEntryYear: string;
  bolsaFamiliaExitYear: string;
  bpcEnrolled: boolean;
  bpcEntryYear: string;
  bpcExitYear: string;
  criancaFelizEnrolled: boolean;
  criancaFelizEntryYear: string;
  criancaFelizExitYear: string;
  otherPrograms: { id: string; programName: string; enrolled: boolean; entryYear: string; exitYear: string }[];
  socialNotes: { id: string; date: string; note: string; professionalOrCras: string }[];
}

export interface SchoolLifeRecord {
  id: string;
  year: string;
  gradeType: string;
  series: string;
  establishmentName: string;
  institutionNature: string;
  observations: string;
}

export interface PrenatalBirthRecord {
  plannedPregnancy: boolean;
  hadPrenatalCare: boolean;
  prenatalConsultationsCount: number;
  startedTrimester: string;
  pregnancyType: string;
  highRiskPregnancy: boolean;
  highRiskReason: string;
  serologies: { cid10Code: string; conditionName: string; trimester1: string; trimester2: string; trimester3: string }[];
  vaccineDtpa: boolean;
  vaccineInfluenza: boolean;
  vaccineHepatitisB: boolean;
  vaccineCovid19: boolean;
  birthPlaceType: string;
  birthPlaceOther: string;
  maternityName: string;
  deliveryType: string;
  cesareanReason: string;
  companionsAtBirth: string;
  birthTime: string;
  skinToSkinContact: boolean;
  breastfedFirstHour: boolean;
  apgar1Min: number;
  apgar5Min: number;
  timelyCordClamping: boolean;
  igMethod: string;
  birthWeightGrams: number;
  birthLengthCm: number;
  birthHeadCircumferenceCm: number;
  weightForGestationalAge: string;
  neonatalResuscitation: boolean;
  assistedBy: string;
  motherBloodType: string;
  indirectCoombs: string;
  babyBloodType: string;
  directCoombs: string;
  ophthalmicProphylaxis: boolean;
  ophthalmicReason: string;
  hemorrhagicProphylaxisVitK: boolean;
  vitKReason: string;
  wasHospitalized: boolean;
  hospitalizationUnit: string;
  hospitalizationDays: number;
  hospitalizationReason: string;
  dischargeReport: string;
  dischargeDate?: string;
  dischargeWeightGrams: number;
  dischargeLengthCm: number;
  dischargeFeeding: string;
}

export interface NeonatalScreeningRecord {
  generalScreeningDate?: string;
  redReflexPerformed: boolean;
  redReflexDate?: string;
  redReflexRightEye: string;
  redReflexLeftEye: string;
  redReflexObservations: string;
  pulseOximetryPerformed: boolean;
  pulseOximetryDate?: string;
  pulseOximetryResult: string;
  pulseOximetryObservations: string;
  hearingScreeningPerformed: boolean;
  hearingScreeningDate?: string;
  hearingMethod: string;
  hearingRightEar: string;
  hearingLeftEar: string;
  hearingConduct: string;
  heelPrickPerformed: boolean;
  heelPrickDate?: string;
  heelPrickRetest: boolean;
  heelPrickRetestDate?: string;
  heelPrickResult: string;
  heelPrickReferral: string;
  heelPrickObservations: string;
}

export interface RoutineConsultationRecord {
  code: string;
  title: string;
  recommendedAgeLabel: string;
  pageReference: string;
  completed: boolean;
  consultationDate?: string;
  headCircumferenceCm?: number;
  weightGrams?: number;
  lengthOrHeightCm?: number;
  bmi?: number;
  bloodPressure: string;
  feedingType: string;
  feedingNotes: string;
  alertSigns: { label: string; present: boolean }[];
  ocularExam: string;
  developmentEvaluation: string;
  vaccinesChecked: boolean;
  ironSupplementationChecked: boolean;
  micronutrientsChecked: boolean;
  vitaminAChecked: boolean;
  dentalChecked: boolean;
  accidentPreventionChecked: boolean;
  violenceSignsChecked: boolean;
  screenTimeChecked: boolean;
  affectionBondsNotes: string;
  professionalAndUnit: string;
  generalNotes: string;
}

export interface DevelopmentSurveillanceRecord {
  riskFactors: { code: string; label: string; present: boolean }[];
  phenotypicAlterations: { code: string; label: string; present: boolean }[];
  overallClassification: string;
  notes6To10Years: { ageBand: string; observations: string; updatedAt?: string }[];
  mChatRQuestions: { number: number; questionText: string; exampleText: string; answer: string; reverseScored: boolean }[];
  mChatREvaluatedAt?: string;
  mChatRClinicalNotes: string;
}

export interface DentalRecord {
  eruptionGroups: { code: string; groupName: string; arch: string; expectedMonthsRange: string; eruptionMonth?: number }[];
  odontogramTeeth: { code: string; name: string; arch: string; side: string; status: string; eruptionMonth?: number; notes: string }[];
  consultations: { id: string; date: string; tooth: string; proceduresAndOrientations: string; returnDate?: string; signatureAndHealthUnit: string }[];
}

export interface SupplementationRecord {
  vitaminADoses: { slotNumber: number; agePeriodLabel: string; appliedDate?: string; healthUnitAndSignature: string }[];
  ironAndMicronutrients: { id: string; deliveryDate: string; childAge: string; supplementDistributed: string; quantityDistributed: string; signature: string }[];
}

export interface CampaignVaccineRecord {
  id: string;
  vaccineName: string;
  date: string;
  dose: string;
  lot: string;
  healthUnit: string;
  signature: string;
}

export interface CadernetaNoteRecord {
  id: string;
  date: string;
  note: string;
  author: string;
}

export interface AgendaEntryRecord {
  id: string;
  entryType: string;
  date: string;
  timeOrSlot: string;
  professionalOrUnit: string;
  notes: string;
  status: string;
}

export interface BabyModel {
  id: string;
  ownerUserId?: string;
  sharedWithUserIds?: string[];
  sharedWithEmails?: string[];
  familyId: string;
  name: string;
  birthDate: string;
  gestationalWeeks: number;
  gestationalDays: number;
  gender: string;
  birthWeightGrams: number;
  birthLengthCm: number;
  currentWeightGrams: number;
  currentHeightCm: number;
  headCircumferenceCm: number;
  bloodType: string;
  pediatrician: PediatricianInfo;
  activeMedications: ActiveMedication[];
  allergies: string[];
  growthLogs: GrowthLog[];
  vaccines: VaccineRecord[];

  // Caderneta da Criança — Menina (5ª Edição - MS, 2022)
  identification?: ChildIdentification;
  addressHistory?: AddressChangeRecord[];
  socialAssistance?: SocialAssistanceRecord;
  educationRecords?: SchoolLifeRecord[];
  prenatalAndBirth?: PrenatalBirthRecord;
  neonatalScreenings?: NeonatalScreeningRecord;
  scheduledConsultations?: RoutineConsultationRecord[];
  rnptObservations?: string;
  developmentSurveillance?: DevelopmentSurveillanceRecord;
  dental?: DentalRecord;
  supplementation?: SupplementationRecord;
  campaignVaccines?: CampaignVaccineRecord[];
  generalNotes?: CadernetaNoteRecord[];
  appointmentsAgenda?: AgendaEntryRecord[];
}

export interface FamilyMember {
  userId: string;
  name: string;
  role: 'Owner' | 'Caregiver' | 'Medical';
  relation: string;
}

@Injectable({ providedIn: 'root' })
export class BabyStore {
  readonly currentUserId = signal<string>(localStorage.getItem('google_user_id') ?? '');
  readonly currentUserEmail = signal<string>(localStorage.getItem('google_user_email') ?? '');
  readonly familyName = signal<string>(localStorage.getItem('google_family_name') ?? '');
  readonly inviteCode = signal<string>(localStorage.getItem('google_invite_code') ?? '');
  readonly members = signal<FamilyMember[]>([]);
  readonly activeMember = signal<FamilyMember>({
    userId: '',
    name: localStorage.getItem('caregiver-name') ?? '',
    role: 'Owner',
    relation: 'Responsável'
  });

  readonly babies = signal<BabyModel[]>(this.loadInitialBabiesFromStorage());
  readonly selectedBabyId = signal<string>(this.loadInitialSelectedBabyId());

  readonly activeBaby = computed<BabyModel>(() => {
    const list = this.babies();
    const id = this.selectedBabyId();
    return list.find(b => b.id === id) ?? list[0] ?? this.createEmptyPlaceholderBaby();
  });

  readonly hasBabies = computed<boolean>(() => this.babies().length > 0);

  readonly chronologicalAgeDays = computed<number>(() => {
    const baby = this.activeBaby();
    if (!baby.id) return 0;
    const diff = Date.now() - new Date(baby.birthDate).getTime();
    return Math.max(0, Math.floor(diff / 86400000));
  });

  readonly correctedAgeDays = computed<number>(() => {
    const baby = this.activeBaby();
    if (!baby.id) return 0;
    const chrono = this.chronologicalAgeDays();
    if (baby.gestationalWeeks >= 37) return chrono;
    const prematureDays = (40 * 7) - (baby.gestationalWeeks * 7 + baby.gestationalDays);
    return Math.max(0, chrono - prematureDays);
  });

  selectBaby(babyId: string): void {
    this.selectedBabyId.set(babyId);
    const uid = this.currentUserId();
    const email = this.currentUserEmail();
    if (uid) {
      localStorage.setItem(`selected_baby_${uid}`, babyId);
    }
    if (email) {
      localStorage.setItem(`selected_baby_email_${email.trim().toLowerCase()}`, babyId);
    }
  }

  selectMember(member: FamilyMember): void {
    this.activeMember.set(member);
    localStorage.setItem('caregiver-role', member.role);
    localStorage.setItem('caregiver-name', member.name);
  }

  setAuthenticatedUserBabies(
    userId: string,
    familyName: string,
    inviteCode: string,
    userBabies: BabyModel[],
    userEmail?: string
  ): void {
    const resolvedEmail = (userEmail ?? this.currentUserEmail() ?? '').trim().toLowerCase();
    this.currentUserId.set(userId);
    if (resolvedEmail) {
      this.currentUserEmail.set(resolvedEmail);
      localStorage.setItem('google_user_email', resolvedEmail);
    }
    if (familyName) {
      this.familyName.set(familyName);
      localStorage.setItem('google_family_name', familyName);
    }
    if (inviteCode) {
      this.inviteCode.set(inviteCode);
      localStorage.setItem('google_invite_code', inviteCode);
    }

    const localBabies = this.getLocalBackupBabies(userId, resolvedEmail);
    const mergedBabies = this.mergeBabiesLists(userBabies ?? [], localBabies, userId);

    this.babies.set(mergedBabies);
    this.saveLocalBackupBabies(mergedBabies, userId, resolvedEmail);

    const savedSelection =
      localStorage.getItem(`selected_baby_${userId}`) ??
      (resolvedEmail ? localStorage.getItem(`selected_baby_email_${resolvedEmail}`) : null);

    if (savedSelection && mergedBabies.some(b => b.id === savedSelection)) {
      this.selectedBabyId.set(savedSelection);
    } else if (mergedBabies.length > 0) {
      this.selectedBabyId.set(mergedBabies[0].id);
    } else {
      this.selectedBabyId.set('');
    }
  }

  addBabyToCurrentUser(newBaby: BabyModel): void {
    const userId = this.currentUserId();
    const email = this.currentUserEmail();
    const existing = this.babies().filter(b => b.id !== newBaby.id);
    const updated = [...existing, newBaby];
    this.babies.set(updated);
    this.selectedBabyId.set(newBaby.id);
    this.saveLocalBackupBabies(updated, userId, email);
    this.selectBaby(newBaby.id);
  }

  updateBabyInCurrentUser(updatedBaby: BabyModel): void {
    const userId = this.currentUserId();
    const email = this.currentUserEmail();
    const exists = this.babies().some(b => b.id === updatedBaby.id);
    const updated = exists
      ? this.babies().map(b => (b.id === updatedBaby.id ? updatedBaby : b))
      : [...this.babies(), updatedBaby];
    this.babies.set(updated);
    this.saveLocalBackupBabies(updated, userId, email);
  }

  removeBabyFromCurrentUser(babyId: string): void {
    const userId = this.currentUserId();
    const email = this.currentUserEmail();
    const updated = this.babies().filter(b => b.id !== babyId);
    this.babies.set(updated);
    this.saveLocalBackupBabies(updated, userId, email);

    try {
      localStorage.removeItem(`babyroutine_events_${babyId}`);
      localStorage.removeItem(`babyroutine_allergens_${babyId}`);
      localStorage.removeItem(`babyroutine_milestones_${babyId}`);
    } catch {}

    const nextId = updated[0]?.id ?? '';
    this.selectedBabyId.set(nextId);
    if (nextId) {
      this.selectBaby(nextId);
    }
  }

  getLocalBackupBabies(userId?: string, email?: string): BabyModel[] {
    const uid = (userId ?? this.currentUserId() ?? '').trim();
    const normEmail = (email ?? this.currentUserEmail() ?? '').trim().toLowerCase();
    const byId = uid ? this.readBabiesKey(`babyroutine_babies_id_${uid}`) : [];
    const byEmail = normEmail ? this.readBabiesKey(`babyroutine_babies_email_${normEmail}`) : [];
    return this.mergeBabiesLists(byId, byEmail, uid);
  }

  saveLocalBackupBabies(babies: BabyModel[], userId?: string, email?: string): void {
    const uid = (userId ?? this.currentUserId() ?? '').trim();
    const normEmail = (email ?? this.currentUserEmail() ?? '').trim().toLowerCase();
    try {
      const serialized = JSON.stringify(babies);
      if (uid) {
        localStorage.setItem(`babyroutine_babies_id_${uid}`, serialized);
      }
      if (normEmail) {
        localStorage.setItem(`babyroutine_babies_email_${normEmail}`, serialized);
      }
    } catch {}
  }

  clearSession(): void {
    this.currentUserId.set('');
    this.currentUserEmail.set('');
    this.familyName.set('');
    this.inviteCode.set('');
    this.members.set([]);
    this.babies.set([]);
    this.selectedBabyId.set('');
  }

  private loadInitialBabiesFromStorage(): BabyModel[] {
    const uid = localStorage.getItem('google_user_id') ?? '';
    const email = localStorage.getItem('google_user_email') ?? '';
    if (!uid && !email) return [];
    return this.getLocalBackupBabies(uid, email);
  }

  private loadInitialSelectedBabyId(): string {
    const uid = localStorage.getItem('google_user_id') ?? '';
    const email = (localStorage.getItem('google_user_email') ?? '').trim().toLowerCase();
    const initialBabies = this.loadInitialBabiesFromStorage();
    const saved =
      (uid ? localStorage.getItem(`selected_baby_${uid}`) : null) ??
      (email ? localStorage.getItem(`selected_baby_email_${email}`) : null);
    if (saved && initialBabies.some(b => b.id === saved)) {
      return saved;
    }
    return initialBabies[0]?.id ?? '';
  }

  private readBabiesKey(key: string): BabyModel[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private mergeBabiesLists(primary: BabyModel[], secondary: BabyModel[], ownerUserId?: string): BabyModel[] {
    const map = new Map<string, BabyModel>();

    for (const b of [...secondary, ...primary]) {
      if (!b || !b.id) continue;
      const existing = map.get(b.id);
      if (!existing) {
        map.set(b.id, {
          ...b,
          ownerUserId: b.ownerUserId || ownerUserId,
          sharedWithUserIds: b.sharedWithUserIds ?? [],
          sharedWithEmails: b.sharedWithEmails ?? [],
          growthLogs: b.growthLogs ?? [],
          vaccines: b.vaccines ?? [],
          allergies: b.allergies ?? [],
          activeMedications: b.activeMedications ?? []
        });
      } else {
        const mergedLogs = this.mergeGrowthLogs(existing.growthLogs ?? [], b.growthLogs ?? []);
        const latestLog = mergedLogs.length > 0 ? mergedLogs[mergedLogs.length - 1] : null;
        const mergedSharedUserIds = Array.from(
          new Set([...(existing.sharedWithUserIds ?? []), ...(b.sharedWithUserIds ?? [])])
        );
        const mergedSharedEmails = Array.from(
          new Set([...(existing.sharedWithEmails ?? []), ...(b.sharedWithEmails ?? [])].map(e => e.trim().toLowerCase()))
        );
        map.set(b.id, {
          ...existing,
          ...b,
          ownerUserId: b.ownerUserId || existing.ownerUserId || ownerUserId,
          sharedWithUserIds: mergedSharedUserIds,
          sharedWithEmails: mergedSharedEmails,
          growthLogs: mergedLogs,
          currentWeightGrams: latestLog ? latestLog.weightGrams : (b.currentWeightGrams || existing.currentWeightGrams),
          currentHeightCm: latestLog ? latestLog.heightCm : (b.currentHeightCm || existing.currentHeightCm),
          headCircumferenceCm: latestLog ? latestLog.headCircumferenceCm : (b.headCircumferenceCm || existing.headCircumferenceCm),
          vaccines: (b.vaccines?.length ?? 0) >= (existing.vaccines?.length ?? 0) ? b.vaccines : existing.vaccines
        });
      }
    }

    return Array.from(map.values());
  }

  private mergeGrowthLogs(a: GrowthLog[], b: GrowthLog[]): GrowthLog[] {
    const map = new Map<string, GrowthLog>();
    for (const item of [...a, ...b]) {
      if (!item) continue;
      const dateKey = (item.measuredAt ?? '').slice(0, 16);
      const key = item.id || `${dateKey}_${item.weightGrams}_${item.heightCm}_${item.headCircumferenceCm}`;
      map.set(key, item);
    }
    return Array.from(map.values()).sort(
      (x, y) => new Date(x.measuredAt).getTime() - new Date(y.measuredAt).getTime()
    );
  }

  private createEmptyPlaceholderBaby(): BabyModel {
    return {
      id: '',
      familyId: '',
      name: '',
      birthDate: new Date().toISOString(),
      gestationalWeeks: 40,
      gestationalDays: 0,
      gender: 'F',
      birthWeightGrams: 0,
      birthLengthCm: 0,
      currentWeightGrams: 0,
      currentHeightCm: 0,
      headCircumferenceCm: 0,
      bloodType: '',
      pediatrician: { name: '', crm: '', emergencyPhone: '' },
      activeMedications: [],
      allergies: [],
      growthLogs: [],
      vaccines: []
    };
  }
}
