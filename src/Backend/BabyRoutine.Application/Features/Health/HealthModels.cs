namespace BabyRoutine.Application.Features.Health;

public record AdministerMedicationDto(
    string MedicationName,
    double DoseMg,
    string? DosageGiven,
    double? MeasuredTemperatureCelsius,
    string? Reason,
    string? Notes
);

public record ToggleMilestoneDto(
    string Status, // NotStarted, InProgress, Achieved
    string? Notes = null,
    string? MediaPhotoUrl = null,
    string? OfficialCode = null // P, A, NV
);

public record RecordGrowthLogDto(
    DateTime? MeasuredAt,
    double WeightGrams,
    double HeightCm,
    double HeadCircumferenceCm,
    double? ZScoreWeightForAge = null,
    string? MeasuredPosition = null,
    int? CorrectedGestationalWeeks = null,
    int? BloodPressureSystolic = null,
    int? BloodPressureDiastolic = null,
    string? BloodPressureObservations = null,
    string? Notes = null
);
