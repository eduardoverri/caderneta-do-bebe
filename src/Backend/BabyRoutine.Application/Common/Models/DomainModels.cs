using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BabyRoutine.Application.Common.Models;

public class UserAccount
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public string GoogleSub { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PictureUrl { get; set; } = string.Empty;
    public string Relation { get; set; } = "Mãe/Pai";
    public string FamilyId { get; set; } = ObjectId.GenerateNewId().ToString();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;
}

public class Family
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public string OwnerUserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string InviteCode { get; set; } = string.Empty;
    public string SubscriptionTier { get; set; } = "FamilyPro";
    public List<FamilyMember> Members { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class FamilyMember
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "Owner"; // Owner, Caregiver, Medical
    public string Relation { get; set; } = "Mãe";
    public NotificationPreferences NotificationPreferences { get; set; } = new();
}

public class NotificationPreferences
{
    public bool PushEnabled { get; set; } = true;
    public bool NightModeAlerts { get; set; } = false;
}

public class Baby
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public string OwnerUserId { get; set; } = string.Empty;
    public string FamilyId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public int GestationalWeeks { get; set; } = 39;
    public int GestationalDays { get; set; } = 0;
    public string Gender { get; set; } = "F";
    public double BirthWeightGrams { get; set; }
    public double BirthLengthCm { get; set; }
    public double CurrentWeightGrams { get; set; }
    public double CurrentHeightCm { get; set; }
    public double HeadCircumferenceCm { get; set; }
    public string BloodType { get; set; } = "O+";
    public PediatricianInfo Pediatrician { get; set; } = new();
    public List<ActiveMedication> ActiveMedications { get; set; } = [];
    public List<string> Allergies { get; set; } = [];
    public List<GrowthLog> GrowthLogs { get; set; } = [];
    public List<VaccineRecord> Vaccines { get; set; } = [];

    // Caderneta da Criança — Menina (5ª Edição - MS, 2022) — Parte I & Parte II
    public ChildIdentification Identification { get; set; } = new();
    public List<AddressChangeRecord> AddressHistory { get; set; } = [];
    public SocialAssistanceRecord SocialAssistance { get; set; } = new();
    public List<SchoolLifeRecord> EducationRecords { get; set; } = [];
    public PrenatalBirthRecord PrenatalAndBirth { get; set; } = new();
    public NeonatalScreeningRecord NeonatalScreenings { get; set; } = new();
    public List<RoutineConsultationRecord> ScheduledConsultations { get; set; } = [];
    public string RnptObservations { get; set; } = string.Empty;
    public DevelopmentSurveillanceRecord DevelopmentSurveillance { get; set; } = new();
    public DentalRecord Dental { get; set; } = new();
    public SupplementationRecord Supplementation { get; set; } = new();
    public List<CampaignVaccineRecord> CampaignVaccines { get; set; } = [];
    public List<CadernetaNoteRecord> GeneralNotes { get; set; } = [];
    public List<AgendaEntryRecord> AppointmentsAgenda { get; set; } = [];

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int GetChronologicalAgeDays(DateTime? referenceDate = null)
    {
        var now = referenceDate ?? DateTime.UtcNow;
        return Math.Max(0, (int)(now - BirthDate).TotalDays);
    }

    public int GetChronologicalAgeMonths(DateTime? referenceDate = null)
    {
        return GetChronologicalAgeDays(referenceDate) / 30;
    }

    public int GetCorrectedAgeDays(DateTime? referenceDate = null)
    {
        var chronoDays = GetChronologicalAgeDays(referenceDate);
        if (GestationalWeeks >= 37) return chronoDays;
        var prematureDays = ((40 * 7) - (GestationalWeeks * 7 + GestationalDays));
        return Math.Max(0, chronoDays - prematureDays);
    }

    public int GetEffectiveAgeMonthsForDevelopment(DateTime? referenceDate = null)
    {
        return GetCorrectedAgeDays(referenceDate) / 30;
    }
}

public class PediatricianInfo
{
    public string Name { get; set; } = string.Empty;
    public string Crm { get; set; } = string.Empty;
    public string EmergencyPhone { get; set; } = string.Empty;
}

public class ActiveMedication
{
    public string Name { get; set; } = string.Empty;
    public string Dose { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public bool IsContinuous { get; set; } = true;
}

/// <summary>
/// Página 4 — Identificação da Criança (Caderneta da Criança, 5ª ed.)
/// </summary>
public class ChildIdentification
{
    public string PhotoUrl { get; set; } = string.Empty;
    public string BirthMunicipality { get; set; } = string.Empty;
    public string MotherName { get; set; } = string.Empty;
    public string FatherName { get; set; } = string.Empty;
    public string GuardianName { get; set; } = string.Empty;
    public string Ethnicity { get; set; } = string.Empty;
    public string RaceColor { get; set; } = "Parda"; // Branca | Preta | Parda | Amarela | Indígena
    public string Address { get; set; } = string.Empty;
    public string ReferencePoint { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Cep { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string UbsName { get; set; } = string.Empty;
    public string DseiPoloBase { get; set; } = string.Empty;
    public string CnsNumber { get; set; } = string.Empty;
    public string DnvNumber { get; set; } = string.Empty;
    public string BirthCertificateNumber { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
}

/// <summary>
/// Página 5 — Mudanças de Endereço / UBS
/// </summary>
public class AddressChangeRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public string Address { get; set; } = string.Empty;
    public string ReferencePoint { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Cep { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string UbsName { get; set; } = string.Empty;
}

/// <summary>
/// Páginas 6 e 7 — Dados da Assistência Social (NIS, CRAS, Bolsa Família, BPC, Criança Feliz, Anotações)
/// </summary>
public class SocialAssistanceRecord
{
    public string ChildNis { get; set; } = string.Empty;
    public string GuardianNis { get; set; } = string.Empty;
    public string CrasName { get; set; } = string.Empty;
    public string CrasPhone { get; set; } = string.Empty;
    public string CrasAddress { get; set; } = string.Empty;
    public bool BolsaFamiliaEnrolled { get; set; }
    public string BolsaFamiliaEntryYear { get; set; } = string.Empty;
    public string BolsaFamiliaExitYear { get; set; } = string.Empty;
    public bool BpcEnrolled { get; set; }
    public string BpcEntryYear { get; set; } = string.Empty;
    public string BpcExitYear { get; set; } = string.Empty;
    public bool CriancaFelizEnrolled { get; set; }
    public string CriancaFelizEntryYear { get; set; } = string.Empty;
    public string CriancaFelizExitYear { get; set; } = string.Empty;
    public List<SocialProgramEntry> OtherPrograms { get; set; } = [];
    public List<SocialNoteEntry> SocialNotes { get; set; } = [];
}

public class SocialProgramEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public string ProgramName { get; set; } = string.Empty;
    public bool Enrolled { get; set; } = true;
    public string EntryYear { get; set; } = string.Empty;
    public string ExitYear { get; set; } = string.Empty;
}

public class SocialNoteEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Note { get; set; } = string.Empty;
    public string ProfessionalOrCras { get; set; } = string.Empty;
}

/// <summary>
/// Páginas 8 e 9 — Anotações sobre a Educação e Vida Escolar
/// </summary>
public class SchoolLifeRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public string Year { get; set; } = string.Empty;
    public string GradeType { get; set; } = "Creche / Educação Infantil";
    public string Series { get; set; } = string.Empty;
    public string EstablishmentName { get; set; } = string.Empty;
    public string InstitutionNature { get; set; } = "Pública"; // Pública | Privada | Religiosa
    public string Observations { get; set; } = string.Empty;
}

/// <summary>
/// Página 69 — Dados sobre Gravidez, Pré-Natal, Parto, Nascimento, Internação Neonatal e Alta
/// </summary>
public class PrenatalBirthRecord
{
    public bool PlannedPregnancy { get; set; } = true;
    public bool HadPrenatalCare { get; set; } = true;
    public int PrenatalConsultationsCount { get; set; } = 8;
    public string StartedTrimester { get; set; } = "1º"; // 1º | 2º | 3º
    public string PregnancyType { get; set; } = "Única"; // Única | Múltipla
    public bool HighRiskPregnancy { get; set; }
    public string HighRiskReason { get; set; } = string.Empty;
    public List<PrenatalSerologyEntry> Serologies { get; set; } = [];
    public bool VaccineDtpa { get; set; } = true;
    public bool VaccineInfluenza { get; set; } = true;
    public bool VaccineHepatitisB { get; set; } = true;
    public bool VaccineCovid19 { get; set; } = true;

    public string BirthPlaceType { get; set; } = "Hospital"; // Hospital | Centro de Parto Normal | Domicílio | Outro
    public string BirthPlaceOther { get; set; } = string.Empty;
    public string MaternityName { get; set; } = string.Empty;
    public string DeliveryType { get; set; } = "Vaginal"; // Vaginal | Cesárea
    public string CesareanReason { get; set; } = string.Empty;
    public string CompanionsAtBirth { get; set; } = string.Empty;
    public string BirthTime { get; set; } = "08:30";
    public bool SkinToSkinContact { get; set; } = true;
    public bool BreastfedFirstHour { get; set; } = true;
    public int Apgar1Min { get; set; } = 9;
    public int Apgar5Min { get; set; } = 10;
    public bool TimelyCordClamping { get; set; } = true;
    public string IgMethod { get; set; } = "USG"; // DUM | USG | Exame do RN
    public double BirthWeightGrams { get; set; } = 3250;
    public double BirthLengthCm { get; set; } = 49.0;
    public double BirthHeadCircumferenceCm { get; set; } = 34.5;
    public string WeightForGestationalAge { get; set; } = "AIG"; // AIG | PIG | GIG
    public bool NeonatalResuscitation { get; set; }
    public string AssistedBy { get; set; } = "Pediatra"; // Pediatra | Obstetra | Enfermeiro | Outro
    public string MotherBloodType { get; set; } = "O+";
    public string IndirectCoombs { get; set; } = "Negativo";
    public string BabyBloodType { get; set; } = "O+";
    public string DirectCoombs { get; set; } = "Negativo";
    public bool OphthalmicProphylaxis { get; set; } = true;
    public string OphthalmicReason { get; set; } = string.Empty;
    public bool HemorrhagicProphylaxisVitK { get; set; } = true;
    public string VitKReason { get; set; } = string.Empty;

    public bool WasHospitalized { get; set; }
    public string HospitalizationUnit { get; set; } = "ALCON"; // Utin | Ucinco | Ucinca | ALCON
    public int HospitalizationDays { get; set; } = 2;
    public string HospitalizationReason { get; set; } = "Alojamento conjunto habitual";
    public string DischargeReport { get; set; } = "RN em ótimo estado geral, sucção vigorosa ao seio materno, eliminações fisiológicas presentes.";
    public DateTime? DischargeDate { get; set; }
    public double DischargeWeightGrams { get; set; } = 3150;
    public double DischargeLengthCm { get; set; } = 49.0;
    public string DischargeFeeding { get; set; } = "Aleitamento materno exclusivo";
}

public class PrenatalSerologyEntry
{
    public string Cid10Code { get; set; } = string.Empty; // A53, B18, B58, Zika
    public string ConditionName { get; set; } = string.Empty;
    public string Trimester1 { get; set; } = "N"; // NR | N | ALT
    public string Trimester2 { get; set; } = "N";
    public string Trimester3 { get; set; } = "N";
}

/// <summary>
/// Páginas 70 e 71 — Triagens Neonatais (Olhinho, Coraçãozinho, Orelhinha, Pezinho)
/// </summary>
public class NeonatalScreeningRecord
{
    public DateTime? GeneralScreeningDate { get; set; }

    public bool RedReflexPerformed { get; set; } = true;
    public DateTime? RedReflexDate { get; set; }
    public string RedReflexRightEye { get; set; } = "Normal"; // Normal | Alterado
    public string RedReflexLeftEye { get; set; } = "Normal";
    public string RedReflexObservations { get; set; } = string.Empty;

    public bool PulseOximetryPerformed { get; set; } = true;
    public DateTime? PulseOximetryDate { get; set; }
    public string PulseOximetryResult { get; set; } = "Normal"; // Normal | Alterado
    public string PulseOximetryObservations { get; set; } = string.Empty;

    public bool HearingScreeningPerformed { get; set; } = true;
    public DateTime? HearingScreeningDate { get; set; }
    public string HearingMethod { get; set; } = "EOA"; // EOA | PEATE
    public string HearingRightEar { get; set; } = "Normal"; // Normal | Alterado
    public string HearingLeftEar { get; set; } = "Normal";
    public string HearingConduct { get; set; } = "Alta com orientação";

    public bool HeelPrickPerformed { get; set; } = true;
    public DateTime? HeelPrickDate { get; set; }
    public bool HeelPrickRetest { get; set; }
    public DateTime? HeelPrickRetestDate { get; set; }
    public string HeelPrickResult { get; set; } = "Normal para todas as condições triadas";
    public string HeelPrickReferral { get; set; } = "AB"; // AB | CER | SSA | SSE
    public string HeelPrickObservations { get; set; } = string.Empty;
}

/// <summary>
/// Páginas 70 a 76 — Consultas Recomendadas (1ª Semana, 1m, 2m, 4m, 6m, 9m, 12m, 18m, 24m, 36m)
/// </summary>
public class RoutineConsultationRecord
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string RecommendedAgeLabel { get; set; } = string.Empty;
    public string PageReference { get; set; } = string.Empty;
    public bool Completed { get; set; }
    public DateTime? ConsultationDate { get; set; }
    public double? HeadCircumferenceCm { get; set; }
    public double? WeightGrams { get; set; }
    public double? LengthOrHeightCm { get; set; }
    public double? Bmi { get; set; }
    public string BloodPressure { get; set; } = string.Empty;
    public string FeedingType { get; set; } = "Aleitamento materno exclusivo";
    public string FeedingNotes { get; set; } = string.Empty;
    public List<ConsultationCheckItem> AlertSigns { get; set; } = [];
    public string OcularExam { get; set; } = "Abertura palpebral normal, reflexo pupilar simétrico, seguimento visual presente";
    public string DevelopmentEvaluation { get; set; } = "DESENVOLVIMENTO ADEQUADO";
    public bool VaccinesChecked { get; set; } = true;
    public bool IronSupplementationChecked { get; set; }
    public bool MicronutrientsChecked { get; set; }
    public bool VitaminAChecked { get; set; }
    public bool DentalChecked { get; set; }
    public bool AccidentPreventionChecked { get; set; } = true;
    public bool ViolenceSignsChecked { get; set; } = true;
    public bool ScreenTimeChecked { get; set; } = true;
    public string AffectionBondsNotes { get; set; } = string.Empty;
    public string ProfessionalAndUnit { get; set; } = string.Empty;
    public string GeneralNotes { get; set; } = string.Empty;
}

public class ConsultationCheckItem
{
    public string Label { get; set; } = string.Empty;
    public bool Present { get; set; }
}

/// <summary>
/// Páginas 77 e 88 a 100 — Vigilância do Crescimento Infantil & Aferição de Pressão Arterial (PA)
/// </summary>
public class GrowthLog
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public DateTime MeasuredAt { get; set; } = DateTime.UtcNow;
    public int AgeDays { get; set; }
    public int? CorrectedGestationalWeeks { get; set; } // Intergrowth-21 (27 a 64 sem, p. 90)
    public double WeightGrams { get; set; }
    public double HeightCm { get; set; }
    public string MeasuredPosition { get; set; } = "Deitada (Comprimento)"; // Deitada (Comprimento) | Em pé (Estatura)
    public double AdjustedHeightCm { get; set; } // Regra de 0,7 cm da p. 88
    public double HeadCircumferenceCm { get; set; }
    public double Bmi { get; set; }
    public int? BloodPressureSystolic { get; set; }
    public int? BloodPressureDiastolic { get; set; }
    public string BloodPressureObservations { get; set; } = string.Empty;
    public double ZScoreWeightForAge { get; set; }
    public double ZScoreHeightForAge { get; set; }
    public double ZScoreHeadCircumference { get; set; }
    public double ZScoreBmiForAge { get; set; }
    public string ClassificationWeight { get; set; } = "Peso adequado para a idade (-2 a +2)";
    public string ClassificationHeight { get; set; } = "Comprimento/estatura adequado para a idade (>= -2)";
    public string ClassificationHeadCircumference { get; set; } = "PC adequado para a idade (-2 a +2)";
    public string ClassificationBmi { get; set; } = "Adequado / Eutrofia (-2 a +1)";
    public string Notes { get; set; } = string.Empty;
}

/// <summary>
/// Páginas 78 a 87 — Vigilância do Desenvolvimento Infantil + M-CHAT-R/F™
/// </summary>
public class DevelopmentSurveillanceRecord
{
    public List<SurveillanceCheckItem> RiskFactors { get; set; } = [];
    public List<SurveillanceCheckItem> PhenotypicAlterations { get; set; } = [];
    public string OverallClassification { get; set; } = "DESENVOLVIMENTO ADEQUADO";
    public List<AgeBandDevelopmentNote> Notes6To10Years { get; set; } = [];
    public List<MChatRQuestionItem> MChatRQuestions { get; set; } = [];
    public DateTime? MChatREvaluatedAt { get; set; }
    public string MChatRClinicalNotes { get; set; } = string.Empty;
}

public class SurveillanceCheckItem
{
    public string Code { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public bool Present { get; set; }
}

public class AgeBandDevelopmentNote
{
    public string AgeBand { get; set; } = string.Empty; // 6 a 7 anos | 7 a 8 anos | 8 a 9 anos | 9 a 10 anos
    public string Observations { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
}

public class MChatRQuestionItem
{
    public int Number { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string ExampleText { get; set; } = string.Empty;
    public string Answer { get; set; } = "Não respondido"; // Sim | Não | Não respondido
    public bool ReverseScored { get; set; } // True nas questões 2, 5 e 12
}

/// <summary>
/// Páginas 101 e 102 — Acompanhamento Odontológico e Odontograma da 1ª Dentição
/// </summary>
public class DentalRecord
{
    public List<ToothEruptionGroup> EruptionGroups { get; set; } = [];
    public List<DeciduousToothItem> OdontogramTeeth { get; set; } = [];
    public List<DentalConsultationEntry> Consultations { get; set; } = [];
}

public class ToothEruptionGroup
{
    public string Code { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty;
    public string Arch { get; set; } = string.Empty; // Superior | Inferior
    public string ExpectedMonthsRange { get; set; } = string.Empty;
    public int? EruptionMonth { get; set; }
}

public class DeciduousToothItem
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Arch { get; set; } = "Superior"; // Superior | Inferior
    public string Side { get; set; } = "Direito"; // Direito | Esquerdo
    public string Status { get; set; } = "Normal"; // Normal | Erupcionado | Cariado (X)
    public int? EruptionMonth { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class DentalConsultationEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Tooth { get; set; } = string.Empty;
    public string ProceduresAndOrientations { get; set; } = string.Empty;
    public DateTime? ReturnDate { get; set; }
    public string SignatureAndHealthUnit { get; set; } = string.Empty;
}

/// <summary>
/// Página 103 — Suplementação de Vitamina A, Ferro ou Outros Micronutrientes
/// </summary>
public class SupplementationRecord
{
    public List<VitaminADoseEntry> VitaminADoses { get; set; } = [];
    public List<MicronutrientSupplyEntry> IronAndMicronutrients { get; set; } = [];
}

public class VitaminADoseEntry
{
    public int SlotNumber { get; set; }
    public string AgePeriodLabel { get; set; } = string.Empty;
    public DateTime? AppliedDate { get; set; }
    public string HealthUnitAndSignature { get; set; } = string.Empty;
}

public class MicronutrientSupplyEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public DateTime DeliveryDate { get; set; } = DateTime.UtcNow;
    public string ChildAge { get; set; } = string.Empty;
    public string SupplementDistributed { get; set; } = "Sulfato Ferroso";
    public string QuantityDistributed { get; set; } = "1 frasco / 30 ml";
    public string Signature { get; set; } = string.Empty;
}

/// <summary>
/// Páginas 104 e 105 — Registro da Aplicação das Vacinas do Calendário Nacional
/// </summary>
public class VaccineRecord
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DoseLabel { get; set; } = "1ª Dose";
    public string AgeGroupSection { get; set; } = "Até 12 meses"; // Até 12 meses | A partir de 12 meses
    public int RecommendedMonth { get; set; }
    public string DiseasesPrevented { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Applied, Overdue
    public DateTime? AppliedAt { get; set; }
    public string Lot { get; set; } = string.Empty;
    public string Laboratory { get; set; } = string.Empty;
    public string HealthUnit { get; set; } = string.Empty;
    public string Signature { get; set; } = string.Empty;
}

/// <summary>
/// Página 106 — Registro de Outras Vacinas e Campanhas
/// </summary>
public class CampaignVaccineRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public string VaccineName { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Dose { get; set; } = "Campanha / Dose única";
    public string Lot { get; set; } = string.Empty;
    public string HealthUnit { get; set; } = string.Empty;
    public string Signature { get; set; } = string.Empty;
}

/// <summary>
/// Página 107 — Anotações Gerais da Caderneta
/// </summary>
public class CadernetaNoteRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Note { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
}

/// <summary>
/// Página 108 — Agenda de Consultas Individuais, Atividades Coletivas e Visitas Domiciliares
/// </summary>
public class AgendaEntryRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public string EntryType { get; set; } = "Consulta Individual"; // Consulta Individual | Atividade em Grupo | Visita Domiciliar
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string TimeOrSlot { get; set; } = "09:00";
    public string ProfessionalOrUnit { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string Status { get; set; } = "Agendado"; // Agendado | Realizado | Remarcado
}

public static class RoutineCategory
{
    public const string Diaper = "Diaper";
    public const string Sleep = "Sleep";
    public const string Feeding = "Feeding";
    public const string Medication = "Medication";
    public const string Bath = "Bath";
    public const string WakeUp = "WakeUp";
}

public class RoutineEvent
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public string OwnerUserId { get; set; } = string.Empty;
    public string BabyId { get; set; } = string.Empty;
    public string FamilyId { get; set; } = string.Empty;
    public string RecordedByUserId { get; set; } = string.Empty;
    public string RecordedByName { get; set; } = "Mãe";
    public string Category { get; set; } = RoutineCategory.Feeding;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public DateTime? EndTimestamp { get; set; }
    public int? DurationMinutes { get; set; }
    public RoutineEventDetails Details { get; set; } = new();
    public ClinicalFlags ClinicalFlags { get; set; } = new();
    public string? Notes { get; set; }
}

public class RoutineEventDetails
{
    // Diaper fields (Seção 4.1)
    public string? State { get; set; } // L = Limpa, U = Urina, E = Evacuação, M = Mista
    public int? VolumeLevel { get; set; } // 1 = Baixo, 2 = Médio, 3 = Alto
    public string? StoolConsistency { get; set; } // LiquidPastous, MoldedPastous, Hardened
    public string? StoolColor { get; set; } // Mustard, BrownishGreen, WhiteGrey, Black, RedBlood
    public bool HasMucus { get; set; }
    public bool HasBlood { get; set; }
    public bool BarrierCreamApplied { get; set; }

    // Sleep fields (Seção 3)
    public string? SleepType { get; set; } // Nap, NightSleep
    public int? WakeWindowPrecedingMinutes { get; set; }
    public string? SleepLocation { get; set; } // Crib, Lap, Stroller, CoSleeping
    public string? FallingAsleepMethod { get; set; }
    public string? SleepQuality { get; set; } // Restless, Good, Interrupted
    public int AwakeningsCount { get; set; }
    public List<string> ReinductionMethods { get; set; } = [];
    public bool HadResistance { get; set; }

    // Feeding fields (Seção 2)
    public string? FeedingType { get; set; } // Breast, Formula, ExpressedMilk, Solids
    public BreastfeedingDetails? BreastfeedingDetails { get; set; }
    public SolidsDetails? SolidsDetails { get; set; }
    public int? FormulaVolumeMl { get; set; }

    // Medication fields (Seção 1.2)
    public string? MedicationName { get; set; }
    public string? DosageGiven { get; set; }
    public double? DosageMg { get; set; }
    public double? BabyWeightAtTimeKg { get; set; }
    public string? Reason { get; set; }
    public double? MeasuredTemperatureCelsius { get; set; }
    public int? MinimumIntervalHours { get; set; }
    public DateTime? NextAllowedDoseAt { get; set; }
}

public class BreastfeedingDetails
{
    public string LastSideOffered { get; set; } = "Left"; // Left, Right, Both
    public int LeftDurationSeconds { get; set; }
    public int RightDurationSeconds { get; set; }
    public string? HungerCueStage { get; set; } // Early, Intermediate, Late
    public List<string> SatietyCues { get; set; } = [];
}

public class SolidsDetails
{
    public string MealType { get; set; } = "Lunch"; // Breakfast, MorningSnack, Lunch, AfternoonSnack, Dinner
    public FoodGroups FoodGroups { get; set; } = new();
    public string AcceptanceLevel { get; set; } = "High"; // Refused, Low, Medium, High
    public List<string> AllergensPresented { get; set; } = [];
    public string EatingAutonomy { get; set; } = "Mixed"; // PureeSpoon, BLW, BLW_Assisted, Mixed, FamilyTable
    public string? HungerCuesNoticed { get; set; }
    public string? SatietyCuesNoticed { get; set; }
}

public class FoodGroups
{
    public List<string> FruitsAndVegetables { get; set; } = [];
    public List<string> CerealsAndTubers { get; set; } = [];
    public List<string> Legumes { get; set; } = [];
    public List<string> AnimalProtein { get; set; } = [];
}

public class ClinicalFlags
{
    public bool IsRedFlagAlert { get; set; }
    public string? AlertMessage { get; set; }
    public string UrgencyLevel { get; set; } = "Normal"; // Normal, HighPriority, Urgent, Emergency
}

public class AllergenTrial
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public string OwnerUserId { get; set; } = string.Empty;
    public string BabyId { get; set; } = string.Empty;
    public string FoodName { get; set; } = string.Empty;
    public string FoodCategory { get; set; } = "Alérgeno Principal";
    public DateTime IntroducedAt { get; set; } = DateTime.UtcNow;
    public DateTime MonitoringEndsAt { get; set; } = DateTime.UtcNow.AddHours(72);
    public string Status { get; set; } = "MonitoringActive"; // MonitoringActive, ReactionReported, SafeCompleted
    public List<ExposureDose> ExposureDoses { get; set; } = [];
    public SymptomsChecklist SymptomsChecklist { get; set; } = new();
    public string? PediatricianNotes { get; set; }
}

public class ExposureDose
{
    public int Day { get; set; }
    public string QuantityOffered { get; set; } = string.Empty;
    public bool ReactionObserved { get; set; }
}

public class SymptomsChecklist
{
    public bool HivesOrRash { get; set; }
    public bool FacialSwelling { get; set; }
    public bool AcuteVomiting { get; set; }
    public bool ExplosiveDiarrhea { get; set; }
    public bool Wheezing { get; set; }

    public bool HasAnySymptom =>
        HivesOrRash || FacialSwelling || AcuteVomiting || ExplosiveDiarrhea || Wheezing;
}

public class MilestoneProgress
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public string OwnerUserId { get; set; } = string.Empty;
    public string BabyId { get; set; } = string.Empty;
    public string MilestoneCode { get; set; } = string.Empty;
    public int? CadernetaNumber { get; set; } // 1..52 oficial da Caderneta (p. 81–85)
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string HowToInvestigate { get; set; } = string.Empty; // Coluna "Como pesquisar" das páginas 81-85
    public string DirectionType { get; set; } = "Cephalocaudal"; // Cephalocaudal, Proximodistal, CadernetaOficial
    public int ExpectedAgeMonths { get; set; }
    public int RedFlagMonthLimit { get; set; }
    public string AgeRangeLabel { get; set; } = string.Empty;
    public string AgeRangeGroup { get; set; } = "0 a 6 meses"; // 0 a 6 meses | 6 a 18 meses | 18 a 42 meses | 42 a 60 meses | 60 a 72 meses
    public string Status { get; set; } = "NotStarted"; // NotStarted, InProgress, Achieved
    public string OfficialCode { get; set; } = "NV"; // P (Presente) | A (Ausente) | NV (Não verificado)
    public Dictionary<string, string> MonthlyChecks { get; set; } = [];
    public DateTime? AchievedAtDate { get; set; }
    public int? ActualAgeAtAchievementDays { get; set; }
    public string? MediaPhotoUrl { get; set; }
    public string? Notes { get; set; }
}
