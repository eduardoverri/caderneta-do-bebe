using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using BabyRoutine.Application.Common.Models;
using BabyRoutine.Application.Engines;
using BabyRoutine.Application.Features.Auth;
using BabyRoutine.Application.Features.Diapers;
using BabyRoutine.Application.Features.Health;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BabyRoutine.Tests;

public class ClinicalEnginesTests
{
    [Theory]
    [InlineData(0, 45, 60, 5)]
    [InlineData(1, 60, 90, 4)]
    [InlineData(3, 75, 120, 4)]
    [InlineData(5, 90, 150, 3)]
    [InlineData(7, 120, 180, 2)]
    [InlineData(12, 180, 240, 2)]
    [InlineData(16, 240, 330, 1)]
    public void WakeWindowEngine_ReturnsExpectedFisiologicalRange(int ageMonths, int minMins, int maxMins, int expectedNaps)
    {
        var range = WakeWindowEngine.GetFisiologicalRange(ageMonths);
        Assert.Equal(minMins, range.Min.TotalMinutes);
        Assert.Equal(maxMins, range.Max.TotalMinutes);
        Assert.Equal(expectedNaps, range.ExpectedNaps);
    }

    [Fact]
    public void WakeWindowEngine_CalculatesSweetSpotAndOverdueStatesCorrectly()
    {
        var engine = new WakeWindowEngine();
        var now = new DateTime(2026, 10, 17, 14, 0, 0, DateTimeKind.Utc);

        var normalStatus = engine.CalculateStatus(now.AddMinutes(-60), 7, now);
        Assert.Equal("Normal", normalStatus.AlertLevel);
        Assert.Equal(60, normalStatus.RemainingMinutesToSweetSpot);

        var optimalStatus = engine.CalculateStatus(now.AddMinutes(-150), 7, now);
        Assert.Equal("Optimal", optimalStatus.AlertLevel);
        Assert.Equal(0, optimalStatus.RemainingMinutesToSweetSpot);

        var overdueStatus = engine.CalculateStatus(now.AddMinutes(-210), 7, now);
        Assert.Equal("Overdue", overdueStatus.AlertLevel);
    }

    [Fact]
    public void MedicationSafetyEngine_BlocksShortIntervalsAndOverdoses()
    {
        var now = DateTime.UtcNow;

        var safeResult = MedicationSafetyEngine.ValidateDose("Paracetamol Gotas", 6.0, 75, now, now.AddHours(-6.5));
        Assert.True(safeResult.IsSafe);

        var shortIntervalResult = MedicationSafetyEngine.ValidateDose("Paracetamol Gotas", 6.0, 75, now, now.AddHours(-3));
        Assert.False(shortIntervalResult.IsSafe);
        Assert.Contains("INTERVALO INSUFICIENTE", shortIntervalResult.Message);

        var overdoseResult = MedicationSafetyEngine.ValidateDose("Paracetamol Gotas", 6.0, 130, now, null);
        Assert.False(overdoseResult.IsSafe);
        Assert.Contains("ALERTA DE SEGURANÇA", overdoseResult.Message);

        var ibuShortResult = MedicationSafetyEngine.ValidateDose("Ibuprofeno 100mg/mL", 8.0, 70, now, now.AddHours(-7));
        Assert.False(ibuShortResult.IsSafe);
    }

    [Fact]
    public void PediatricStoolClassifier_DetectsAcholicMelenaAndBloodRedFlags()
    {
        var acholic = PediatricStoolClassifier.Evaluate("WhiteGrey", "LiquidPastous", false, 60);
        Assert.True(acholic.IsClinicalAlert);
        Assert.Equal("Emergency", acholic.UrgencyLevel);

        var melena = PediatricStoolClassifier.Evaluate("Black", "MoldedPastous", false, 30);
        Assert.True(melena.IsClinicalAlert);
        Assert.Equal("Urgent", melena.UrgencyLevel);

        var blood = PediatricStoolClassifier.Evaluate("Mustard", "LiquidPastous", true, 90);
        Assert.True(blood.IsClinicalAlert);
        Assert.Equal("HighPriority", blood.UrgencyLevel);

        var normal = PediatricStoolClassifier.Evaluate("Mustard", "LiquidPastous", false, 90);
        Assert.False(normal.IsClinicalAlert);
        Assert.Equal("Normal", normal.UrgencyLevel);
    }

    [Fact]
    public void BabyModel_CalculatesChronologicalAndCorrectedAgeForPrematureBabies()
    {
        var refDate = new DateTime(2026, 10, 17, 12, 0, 0, DateTimeKind.Utc);
        var prematureBaby = new Baby
        {
            BirthDate = refDate.AddDays(-120),
            GestationalWeeks = 34,
            GestationalDays = 0
        };

        Assert.Equal(120, prematureBaby.GetChronologicalAgeDays(refDate));
        Assert.Equal(78, prematureBaby.GetCorrectedAgeDays(refDate));
    }
}

public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        var tempStoreFile = Path.Combine(Path.GetTempPath(), $"babyroutine-test-{Guid.NewGuid():N}.json");
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IGoogleSsoValidator>();
                services.AddSingleton<IGoogleSsoValidator, TestGoogleSsoValidator>();
                services.RemoveAll<BabyRoutine.Infrastructure.Persistence.Repositories.InMemoryDataStore>();
                services.AddSingleton(new BabyRoutine.Infrastructure.Persistence.Repositories.InMemoryDataStore(tempStoreFile));
            });
        });
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task HealthAndProtectedEndpoints_EnforceGoogleSsoAndReturnValidClinicalPayloads()
    {
        var healthRes = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, healthRes.StatusCode);

        // Unauthenticated requests to protected endpoints must return 401 Unauthorized
        var unauthBabiesRes = await _client.GetAsync("/api/babies");
        Assert.Equal(HttpStatusCode.Unauthorized, unauthBabiesRes.StatusCode);

        // Authenticate via Google SSO IdToken
        var loginRes = await _client.PostAsJsonAsync("/api/auth/google", new GoogleLoginRequestDto(
            IdToken: "test-google-id-token:sub-user-1:user1@example.com:User One"
        ));
        Assert.Equal(HttpStatusCode.OK, loginRes.StatusCode);
        var loginPayload = await loginRes.Content.ReadFromJsonAsync<JsonElement>();
        var token = loginPayload.GetProperty("token").GetString()!;

        using var authClient = _factory.CreateClient();
        authClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createBabyRes = await authClient.PostAsJsonAsync("/api/babies", new CreateChildRequestDto(
            Name: "Child One",
            BirthDate: DateTime.UtcNow.AddDays(-210),
            GestationalWeeks: 39,
            GestationalDays: 0,
            Gender: "M",
            BirthWeightGrams: 3200,
            BirthLengthCm: 49.0,
            CurrentWeightGrams: 7800,
            CurrentHeightCm: 68.0,
            HeadCircumferenceCm: 44.0,
            BloodType: "O+"
        ));
        Assert.Equal(HttpStatusCode.Created, createBabyRes.StatusCode);
        var createdBaby = await createBabyRes.Content.ReadFromJsonAsync<Baby>();
        Assert.NotNull(createdBaby);
        var babyId = createdBaby!.Id;

        var timelineRes = await authClient.GetAsync($"/api/babies/{babyId}/timeline");
        Assert.Equal(HttpStatusCode.OK, timelineRes.StatusCode);

        var wakeRes = await authClient.GetAsync($"/api/babies/{babyId}/sleep/wake-window");
        Assert.Equal(HttpStatusCode.OK, wakeRes.StatusCode);

        var diaperDto = new QuickDiaperDto("E2", 2, "WhiteGrey", "MoldedPastous", false, false, true, "Teste de alerta clínico");
        var postDiaper = await authClient.PostAsJsonAsync($"/api/babies/{babyId}/diapers/quick", diaperDto);
        Assert.Equal(HttpStatusCode.Created, postDiaper.StatusCode);
        var createdEvent = await postDiaper.Content.ReadFromJsonAsync<RoutineEvent>();
        Assert.NotNull(createdEvent);
        Assert.True(createdEvent!.ClinicalFlags.IsRedFlagAlert);
        Assert.Equal("Emergency", createdEvent.ClinicalFlags.UrgencyLevel);

        var overdoseDto = new AdministerMedicationDto("Paracetamol Gotas", 300, "30 gotas", 38.5, "Febre", null);
        var postOverdose = await authClient.PostAsJsonAsync($"/api/babies/{babyId}/medications/administer", overdoseDto);
        Assert.Equal(HttpStatusCode.BadRequest, postOverdose.StatusCode);

        var reportRes = await authClient.GetAsync($"/api/babies/{babyId}/reports/pediatric-summary");
        Assert.Equal(HttpStatusCode.OK, reportRes.StatusCode);
    }

    [Fact]
    public async Task GoogleSsoAuth_IsolatesDataByUserAndByChild()
    {
        // 1. Login via Google SSO como Usuário A
        var userALogin = await _client.PostAsJsonAsync("/api/auth/google", new GoogleLoginRequestDto(
            IdToken: "test-google-id-token:google-sub-parent-a:parent.a@example.com:Parent A"
        ));
        Assert.Equal(HttpStatusCode.OK, userALogin.StatusCode);
        var userAPayload = await userALogin.Content.ReadFromJsonAsync<JsonElement>();
        var userAToken = userAPayload.GetProperty("token").GetString()!;
        Assert.Empty(userAPayload.GetProperty("babies").EnumerateArray());

        using var clientA = _factory.CreateClient();
        clientA.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userAToken);

        // 2. Usuário A cadastra 2 filhos separados
        var child1Res = await clientA.PostAsJsonAsync("/api/babies", new CreateChildRequestDto(
            Name: "First Child A",
            BirthDate: DateTime.UtcNow.AddDays(-180),
            GestationalWeeks: 38,
            GestationalDays: 2,
            Gender: "M",
            BirthWeightGrams: 3100,
            BirthLengthCm: 48.5,
            CurrentWeightGrams: 7200,
            CurrentHeightCm: 66.0,
            HeadCircumferenceCm: 43.0,
            BloodType: "A+"
        ));
        var child1 = (await child1Res.Content.ReadFromJsonAsync<Baby>())!;

        var child2Res = await clientA.PostAsJsonAsync("/api/babies", new CreateChildRequestDto(
            Name: "Second Child A",
            BirthDate: DateTime.UtcNow.AddDays(-45),
            GestationalWeeks: 39,
            GestationalDays: 1,
            Gender: "F",
            BirthWeightGrams: 3300,
            BirthLengthCm: 49.5,
            CurrentWeightGrams: 4400,
            CurrentHeightCm: 54.0,
            HeadCircumferenceCm: 37.5,
            BloodType: "O+"
        ));
        var child2 = (await child2Res.Content.ReadFromJsonAsync<Baby>())!;

        // Registra evento apenas no Filho 1
        await clientA.PostAsJsonAsync($"/api/babies/{child1.Id}/diapers/quick",
            new QuickDiaperDto("U2", 2, null, null, false, false, true, null));

        // 3. Isolamento por Filho dentro da mesma Conta Google
        var child1Timeline = await clientA.GetFromJsonAsync<JsonElement>($"/api/babies/{child1.Id}/timeline");
        var child2Timeline = await clientA.GetFromJsonAsync<JsonElement>($"/api/babies/{child2.Id}/timeline");
        Assert.Single(child1Timeline.GetProperty("events").EnumerateArray());
        Assert.Empty(child2Timeline.GetProperty("events").EnumerateArray());

        // 4. Login via Google SSO como Usuário B e verificação de isolamento entre usuários
        var userBLogin = await _client.PostAsJsonAsync("/api/auth/google", new GoogleLoginRequestDto(
            AccessToken: "test-google-access-token:google-sub-parent-b:parent.b@example.com:Parent B"
        ));
        var userBPayload = await userBLogin.Content.ReadFromJsonAsync<JsonElement>();
        var userBToken = userBPayload.GetProperty("token").GetString()!;

        using var clientB = _factory.CreateClient();
        clientB.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userBToken);

        var forbiddenRes = await clientB.GetAsync($"/api/babies/{child1.Id}/timeline");
        Assert.Equal(HttpStatusCode.NotFound, forbiddenRes.StatusCode);
    }

    [Fact]
    public async Task PostDeploy_PreservesUserSessionAndRestoresChildrenAndRecords()
    {
        // 1. Deploy inicial: usuário autentica, cria filho e registra eventos
        var loginRes = await _client.PostAsJsonAsync("/api/auth/google", new GoogleLoginRequestDto(
            IdToken: "test-google-id-token:sub-deploy-user:deploy.user@example.com:Deploy User"
        ));
        Assert.Equal(HttpStatusCode.OK, loginRes.StatusCode);
        var loginPayload = await loginRes.Content.ReadFromJsonAsync<JsonElement>();
        var token = loginPayload.GetProperty("token").GetString()!;

        using var client1 = _factory.CreateClient();
        client1.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createRes = await client1.PostAsJsonAsync("/api/babies", new CreateChildRequestDto(
            Name: "Persistent Baby",
            BirthDate: DateTime.UtcNow.AddDays(-90),
            GestationalWeeks: 39,
            GestationalDays: 0,
            Gender: "F",
            BirthWeightGrams: 3250,
            BirthLengthCm: 49.0,
            CurrentWeightGrams: 5800,
            CurrentHeightCm: 59.5,
            HeadCircumferenceCm: 40.2,
            BloodType: "A+"
        ));
        var baby = (await createRes.Content.ReadFromJsonAsync<Baby>())!;

        var diaperRes = await client1.PostAsJsonAsync($"/api/babies/{baby.Id}/diapers/quick",
            new QuickDiaperDto("U2", 2, null, null, false, false, true, "Antes do deploy"));
        var eventItem = (await diaperRes.Content.ReadFromJsonAsync<RoutineEvent>())!;

        // 2. Simula novo deploy em container stateless (novo InMemoryDataStore vazio)
        var freshStoreFile = Path.Combine(Path.GetTempPath(), $"babyroutine-fresh-deploy-{Guid.NewGuid():N}.json");
        using var redeployedFactory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IGoogleSsoValidator>();
                services.AddSingleton<IGoogleSsoValidator, TestGoogleSsoValidator>();
                services.RemoveAll<BabyRoutine.Infrastructure.Persistence.Repositories.InMemoryDataStore>();
                services.AddSingleton(new BabyRoutine.Infrastructure.Persistence.Repositories.InMemoryDataStore(freshStoreFile));
            });
        });

        using var clientAfterDeploy = redeployedFactory.CreateClient();
        clientAfterDeploy.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // /api/auth/me deve reconstruir o usuário a partir do JWT válido (200 OK, sem deslogar)
        var meRes = await clientAfterDeploy.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, meRes.StatusCode);

        // /api/sync/restore sincroniza filhos e registros do backup local para o novo container
        var restoreRes = await clientAfterDeploy.PostAsJsonAsync("/api/sync/restore", new RestoreUserStateRequestDto(
            Babies: [baby],
            RoutineEvents: [eventItem]
        ));
        Assert.Equal(HttpStatusCode.OK, restoreRes.StatusCode);

        var timelineAfterDeploy = await clientAfterDeploy.GetFromJsonAsync<JsonElement>($"/api/babies/{baby.Id}/timeline");
        Assert.Single(timelineAfterDeploy.GetProperty("events").EnumerateArray());
    }

    [Fact]
    public void CadernetaClinicalEngine_Applies07CmHeightRuleAndMChatREvaluation()
    {
        // Regra de 0,7 cm (página 88): < 2 anos medida em pé soma 0,7 cm; >= 2 anos medida deitada subtrai 0,7 cm
        var adjustedUnder2Standing = CadernetaClinicalEngine.CalculateAdjustedHeightCm(75.0, ageDays: 400, "Em pé (Estatura)");
        Assert.Equal(75.7, adjustedUnder2Standing);

        var adjustedOver2Lying = CadernetaClinicalEngine.CalculateAdjustedHeightCm(88.0, ageDays: 800, "Deitada (Comprimento)");
        Assert.Equal(87.3, adjustedOver2Lying);

        // Classificação M-CHAT-R/F™ (página 87)
        var questions = BabyRoutine.Infrastructure.Persistence.SeedData.CreateDefaultMChatRQuestions();
        var lowRisk = CadernetaClinicalEngine.EvaluateMChatR(questions);
        Assert.Equal(0, lowRisk.RiskScore);
        Assert.Contains("Baixo Risco", lowRisk.RiskClassification);

        // Questão 2 é reverse-scored ("Sim" = risco); Questões 1, 3, 6 ("Não" = risco) => 4 pontos (Risco Moderado)
        questions.First(q => q.Number == 2).Answer = "Sim";
        questions.First(q => q.Number == 1).Answer = "Não";
        questions.First(q => q.Number == 3).Answer = "Não";
        questions.First(q => q.Number == 6).Answer = "Não";

        var modRisk = CadernetaClinicalEngine.EvaluateMChatR(questions);
        Assert.Equal(4, modRisk.RiskScore);
        Assert.Contains("Risco Moderado", modRisk.RiskClassification);
    }

    [Fact]
    public async Task CadernetaFullCrud_AllowsRegisteringAlteringAndViewingAllCadernetaSectionsAndEvents()
    {
        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IGoogleSsoValidator>();
                services.AddSingleton<IGoogleSsoValidator, TestGoogleSsoValidator>();
            });
        }).CreateClient();

        var authRes = await client.PostAsJsonAsync("/api/auth/google",
            new GoogleLoginRequestDto(IdToken: "test-google-token:sub-caderneta:mae.helena@gmail.com:Helena"));
        authRes.EnsureSuccessStatusCode();
        var authPayload = await authRes.Content.ReadFromJsonAsync<JsonElement>();
        var token = authPayload.GetProperty("token").GetString()!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createRes = await client.PostAsJsonAsync("/api/babies", new CreateChildRequestDto(
            Name: "Sofia Mendes",
            BirthDate: DateTime.UtcNow.AddMonths(-8),
            GestationalWeeks: 38,
            GestationalDays: 4,
            Gender: "F",
            BirthWeightGrams: 3180,
            BirthLengthCm: 49.0,
            CurrentWeightGrams: 8200,
            CurrentHeightCm: 69.5,
            HeadCircumferenceCm: 43.8,
            BloodType: "A+"
        ));
        createRes.EnsureSuccessStatusCode();
        var baby = await createRes.Content.ReadFromJsonAsync<Baby>();
        Assert.NotNull(baby);
        Assert.True(baby!.Vaccines.Count >= 30);
        Assert.Equal(10, baby.ScheduledConsultations.Count);
        Assert.Equal(20, baby.Dental.OdontogramTeeth.Count);
        Assert.Equal(20, baby.DevelopmentSurveillance.MChatRQuestions.Count);

        // 1. Alterar Identificação (p. 4), Endereços (p. 5), Assistência Social (p. 6-7) e Vida Escolar (p. 8-9)
        baby.Identification.CnsNumber = "700001234567890";
        baby.Identification.UbsName = "UBS Vila Mariana";
        baby.Identification.MotherName = "Helena Mendes";
        baby.SocialAssistance.BolsaFamiliaEnrolled = true;
        baby.SocialAssistance.BolsaFamiliaEntryYear = "2025";
        baby.AddressHistory.Add(new AddressChangeRecord { Address = "Rua das Flores, 123", City = "São Paulo", State = "SP", UbsName = "UBS Vila Mariana" });
        baby.EducationRecords.Add(new SchoolLifeRecord { Year = "2026", GradeType = "Berçário I", EstablishmentName = "CEI Estrelinha", InstitutionNature = "Pública" });

        var idRes = await client.PutAsJsonAsync($"/api/babies/{baby.Id}/identification", new
        {
            name = "Sofia Mendes Atualizada",
            identification = baby.Identification,
            addressHistory = baby.AddressHistory,
            socialAssistance = baby.SocialAssistance,
            educationRecords = baby.EducationRecords
        });
        idRes.EnsureSuccessStatusCode();
        var updatedBaby = await idRes.Content.ReadFromJsonAsync<Baby>();
        Assert.Equal("Sofia Mendes Atualizada", updatedBaby!.Name);
        Assert.Equal("700001234567890", updatedBaby.Identification.CnsNumber);
        Assert.Single(updatedBaby.AddressHistory);
        Assert.Single(updatedBaby.EducationRecords);

        // 2. Alterar Odontograma (p. 101-102) e Vacinas + Campanhas (p. 104-106)
        updatedBaby.Dental.OdontogramTeeth.First(t => t.Code == "71").Status = "Erupcionado";
        updatedBaby.Dental.Consultations.Add(new DentalConsultationEntry
        {
            Tooth = "71, 81",
            ProceduresAndOrientations = "Orientação sobre escovação com creme dental fluoretado (1000 ppm - grão de arroz)",
            SignatureAndHealthUnit = "Dra. Camila CRO-SP"
        });
        var dentalRes = await client.PutAsJsonAsync($"/api/babies/{baby.Id}/dental", updatedBaby.Dental);
        dentalRes.EnsureSuccessStatusCode();

        var vaxRes = await client.PutAsJsonAsync($"/api/babies/{baby.Id}/vaccines/BCG", new
        {
            status = "Applied",
            appliedAt = DateTime.UtcNow.AddMonths(-8),
            lot = "LOTE-BCG-99",
            laboratory = "FAP",
            healthUnit = "Maternidade Santa Joana",
            signature = "Enf. Paula"
        });
        vaxRes.EnsureSuccessStatusCode();

        // 3. Registrar, Alterar (PUT) e Excluir (DELETE) Evento de Rotina
        var evCreate = await client.PostAsJsonAsync($"/api/babies/{baby.Id}/events", new
        {
            category = RoutineCategory.Sleep,
            timestamp = DateTime.UtcNow.AddHours(-2),
            endTimestamp = DateTime.UtcNow.AddHours(-1),
            durationMinutes = 60,
            recordedByName = "Helena",
            details = new RoutineEventDetails { SleepType = "Nap", SleepLocation = "Crib" },
            notes = "Soneca da manhã"
        });
        evCreate.EnsureSuccessStatusCode();
        var createdEv = await evCreate.Content.ReadFromJsonAsync<RoutineEvent>();
        Assert.NotNull(createdEv);

        var evUpdate = await client.PutAsJsonAsync($"/api/babies/{baby.Id}/events/{createdEv!.Id}", new
        {
            durationMinutes = 75,
            notes = "Soneca da manhã prolongada (alterado)"
        });
        evUpdate.EnsureSuccessStatusCode();
        var updatedEv = await evUpdate.Content.ReadFromJsonAsync<RoutineEvent>();
        Assert.Equal(75, updatedEv!.DurationMinutes);
        Assert.Equal("Soneca da manhã prolongada (alterado)", updatedEv.Notes);

        var evDelete = await client.DeleteAsync($"/api/babies/{baby.Id}/events/{createdEv.Id}");
        Assert.Equal(HttpStatusCode.NoContent, evDelete.StatusCode);
    }

    private sealed class TestGoogleSsoValidator : IGoogleSsoValidator
    {
        public Task<GoogleSsoPayload> ValidateAsync(GoogleLoginRequestDto dto, CancellationToken ct = default)
        {
            var raw = dto.IdToken ?? dto.AccessToken ?? dto.AuthorizationCode;
            if (string.IsNullOrWhiteSpace(raw) || !raw.StartsWith("test-google-"))
            {
                throw new UnauthorizedAccessException("Token Google SSO inválido.");
            }

            var parts = raw.Split(':');
            var sub = parts.Length > 1 ? parts[1] : "sub-default";
            var email = parts.Length > 2 ? parts[2] : "user@example.com";
            var name = parts.Length > 3 ? parts[3] : "User";

            return Task.FromResult(new GoogleSsoPayload(
                GoogleSub: sub,
                Email: email,
                EmailVerified: true,
                Name: name,
                PictureUrl: string.Empty
            ));
        }
    }
}
