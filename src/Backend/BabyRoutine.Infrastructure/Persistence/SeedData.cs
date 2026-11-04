using BabyRoutine.Application.Common.Models;

namespace BabyRoutine.Infrastructure.Persistence;

public static class SeedData
{
    public static void EnsureCadernetaDataPopulated(Baby baby)
    {
        var ageDays = baby.GetChronologicalAgeDays();

        baby.Identification ??= new ChildIdentification();
        baby.AddressHistory ??= [];
        baby.SocialAssistance ??= new SocialAssistanceRecord();
        baby.SocialAssistance.OtherPrograms ??= [];
        baby.SocialAssistance.SocialNotes ??= [];
        baby.EducationRecords ??= [];

        baby.PrenatalAndBirth ??= new PrenatalBirthRecord
        {
            BirthWeightGrams = baby.BirthWeightGrams > 0 ? baby.BirthWeightGrams : 3200,
            BirthLengthCm = baby.BirthLengthCm > 0 ? baby.BirthLengthCm : 49.0,
            BabyBloodType = baby.BloodType,
            DischargeDate = baby.BirthDate.AddDays(2)
        };
        if (baby.PrenatalAndBirth.Serologies is not { Count: > 0 })
        {
            baby.PrenatalAndBirth.Serologies =
            [
                new() { Cid10Code = "A53", ConditionName = "Sífilis (CID-10 A53)", Trimester1 = "N", Trimester2 = "N", Trimester3 = "N" },
                new() { Cid10Code = "B18", ConditionName = "Hepatite B/C (CID-10 B18)", Trimester1 = "N", Trimester2 = "N", Trimester3 = "N" },
                new() { Cid10Code = "B58", ConditionName = "Toxoplasmose (CID-10 B58)", Trimester1 = "N", Trimester2 = "N", Trimester3 = "N" },
                new() { Cid10Code = "Zika", ConditionName = "Vírus Zika", Trimester1 = "N", Trimester2 = "N", Trimester3 = "N" }
            ];
        }

        baby.NeonatalScreenings ??= new NeonatalScreeningRecord
        {
            GeneralScreeningDate = baby.BirthDate.AddDays(2),
            RedReflexDate = baby.BirthDate.AddDays(1),
            PulseOximetryDate = baby.BirthDate.AddDays(1),
            HearingScreeningDate = baby.BirthDate.AddDays(2),
            HeelPrickDate = baby.BirthDate.AddDays(3)
        };

        if (baby.ScheduledConsultations is not { Count: > 0 })
        {
            baby.ScheduledConsultations = CreateDefaultConsultations(baby.BirthDate, ageDays);
        }

        baby.DevelopmentSurveillance ??= new DevelopmentSurveillanceRecord();
        if (baby.DevelopmentSurveillance.RiskFactors is not { Count: > 0 })
        {
            baby.DevelopmentSurveillance.RiskFactors = CreateDefaultRiskFactors(baby);
        }
        if (baby.DevelopmentSurveillance.PhenotypicAlterations is not { Count: > 0 })
        {
            baby.DevelopmentSurveillance.PhenotypicAlterations = CreateDefaultPhenotypicAlterations();
        }
        if (baby.DevelopmentSurveillance.Notes6To10Years is not { Count: > 0 })
        {
            baby.DevelopmentSurveillance.Notes6To10Years =
            [
                new() { AgeBand = "6 a 7 anos", Observations = string.Empty },
                new() { AgeBand = "7 a 8 anos", Observations = string.Empty },
                new() { AgeBand = "8 a 9 anos", Observations = string.Empty },
                new() { AgeBand = "9 a 10 anos", Observations = string.Empty }
            ];
        }
        if (baby.DevelopmentSurveillance.MChatRQuestions is not { Count: > 0 })
        {
            baby.DevelopmentSurveillance.MChatRQuestions = CreateDefaultMChatRQuestions();
        }

        baby.Dental ??= new DentalRecord();
        if (baby.Dental.EruptionGroups is not { Count: > 0 })
        {
            baby.Dental.EruptionGroups = CreateDefaultToothEruptionGroups();
        }
        if (baby.Dental.OdontogramTeeth is not { Count: > 0 })
        {
            baby.Dental.OdontogramTeeth = CreateDefaultOdontogramTeeth();
        }
        baby.Dental.Consultations ??= [];

        baby.Supplementation ??= new SupplementationRecord();
        if (baby.Supplementation.VitaminADoses is not { Count: > 0 })
        {
            baby.Supplementation.VitaminADoses = CreateDefaultVitaminADoses();
        }
        baby.Supplementation.IronAndMicronutrients ??= [];

        if (baby.Vaccines is not { Count: > 0 })
        {
            baby.Vaccines = CreateDefaultVaccines();
        }
        else
        {
            var defaults = CreateDefaultVaccines();
            foreach (var def in defaults)
            {
                if (!baby.Vaccines.Any(v => v.Code.Equals(def.Code, StringComparison.OrdinalIgnoreCase)))
                {
                    baby.Vaccines.Add(def);
                }
            }
        }

        baby.CampaignVaccines ??= [];
        baby.GeneralNotes ??= [];
        baby.AppointmentsAgenda ??= [];
    }

    public static List<VaccineRecord> CreateDefaultVaccines() =>
    [
        //Todas as doses individuais do Calendário Nacional de Vacinação (Páginas 104 e 105)
        new() { Code = "BCG", Name = "BCG", DoseLabel = "Dose única", AgeGroupSection = "Até 12 meses", RecommendedMonth = 0, DiseasesPrevented = "Formas graves de tuberculose (miliar e meníngea)", Status = "Pending" },
        new() { Code = "HEPB_0", Name = "Hepatite B", DoseLabel = "Dose ao nascer", AgeGroupSection = "Até 12 meses", RecommendedMonth = 0, DiseasesPrevented = "Hepatite B", Status = "Pending" },
        new() { Code = "PENTA_1", Name = "Penta (DTP/Hib/HB)", DoseLabel = "1ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 2, DiseasesPrevented = "Difteria, tétano, coqueluche, Haemophilus influenzae B e Hepatite B", Status = "Pending" },
        new() { Code = "VIP_1", Name = "Poliomielite 1, 2 e 3 (inativada) - VIP", DoseLabel = "1ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 2, DiseasesPrevented = "Poliomielite", Status = "Pending" },
        new() { Code = "ROTA_1", Name = "Rotavírus humano G1P1 (VRH)", DoseLabel = "1ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 2, DiseasesPrevented = "Diarreia por rotavírus", Status = "Pending" },
        new() { Code = "PNEUMO10_1", Name = "Pneumocócica 10-valente (conjugada)", DoseLabel = "1ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 2, DiseasesPrevented = "Pneumonia, otite, meningite e outras doenças pelo Pneumococo", Status = "Pending" },
        new() { Code = "MENINGO_C_1", Name = "Meningocócica C (conjugada)", DoseLabel = "1ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 3, DiseasesPrevented = "Doença invasiva pela Neisseria meningitidis do sorogrupo C", Status = "Pending" },
        new() { Code = "PENTA_2", Name = "Penta (DTP/Hib/HB)", DoseLabel = "2ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 4, DiseasesPrevented = "Difteria, tétano, coqueluche, Haemophilus influenzae B e Hepatite B", Status = "Pending" },
        new() { Code = "VIP_2", Name = "Poliomielite 1, 2 e 3 (inativada) - VIP", DoseLabel = "2ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 4, DiseasesPrevented = "Poliomielite", Status = "Pending" },
        new() { Code = "ROTA_2", Name = "Rotavírus humano G1P1 (VRH)", DoseLabel = "2ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 4, DiseasesPrevented = "Diarreia por rotavírus", Status = "Pending" },
        new() { Code = "PNEUMO10_2", Name = "Pneumocócica 10-valente (conjugada)", DoseLabel = "2ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 4, DiseasesPrevented = "Pneumonia, otite, meningite e outras doenças pelo Pneumococo", Status = "Pending" },
        new() { Code = "MENINGO_C_2", Name = "Meningocócica C (conjugada)", DoseLabel = "2ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 5, DiseasesPrevented = "Doença invasiva pela Neisseria meningitidis do sorogrupo C", Status = "Pending" },
        new() { Code = "PENTA_3", Name = "Penta (DTP/Hib/HB)", DoseLabel = "3ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 6, DiseasesPrevented = "Difteria, tétano, coqueluche, Haemophilus influenzae B e Hepatite B", Status = "Pending" },
        new() { Code = "VIP_3", Name = "Poliomielite 1, 2 e 3 (inativada) - VIP", DoseLabel = "3ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 6, DiseasesPrevented = "Poliomielite", Status = "Pending" },
        new() { Code = "INFLUENZA_1", Name = "Influenza (gripe)", DoseLabel = "1ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 6, DiseasesPrevented = "Infecções pelo vírus influenza", Status = "Pending" },
        new() { Code = "INFLUENZA_2", Name = "Influenza (gripe)", DoseLabel = "2ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 7, DiseasesPrevented = "Infecções pelo vírus influenza", Status = "Pending" },
        new() { Code = "FEBRE_AMARELA_1", Name = "Febre Amarela (atenuada)", DoseLabel = "1ª Dose", AgeGroupSection = "Até 12 meses", RecommendedMonth = 9, DiseasesPrevented = "Febre amarela", Status = "Pending" },

        // A partir de 12 meses
        new() { Code = "PNEUMO10_REF", Name = "Pneumocócica 10-valente", DoseLabel = "Reforço", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 12, DiseasesPrevented = "Pneumonia, otite, meningite pelo Pneumococo", Status = "Pending" },
        new() { Code = "MENINGO_C_REF", Name = "Meningocócica C", DoseLabel = "Reforço", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 12, DiseasesPrevented = "Doença invasiva pela Neisseria meningitidis C", Status = "Pending" },
        new() { Code = "SCR_1", Name = "Tríplice viral (SCR)", DoseLabel = "1ª Dose", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 12, DiseasesPrevented = "Sarampo, caxumba e rubéola", Status = "Pending" },
        new() { Code = "DTP_REF1", Name = "DTP (Tríplice bacteriana)", DoseLabel = "1º Reforço", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 15, DiseasesPrevented = "Difteria, tétano e coqueluche", Status = "Pending" },
        new() { Code = "VOP_REF1", Name = "Poliomielite 1 e 3 (atenuada) - VOP", DoseLabel = "1º Reforço", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 15, DiseasesPrevented = "Poliomielite", Status = "Pending" },
        new() { Code = "HEPA_1", Name = "Hepatite A", DoseLabel = "1ª Dose", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 15, DiseasesPrevented = "Hepatite A", Status = "Pending" },
        new() { Code = "TETRA_VIRAL", Name = "Tetra viral (SCRV)", DoseLabel = "1ª Dose", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 15, DiseasesPrevented = "Sarampo, caxumba, rubéola e varicela", Status = "Pending" },
        new() { Code = "DTP_REF2", Name = "DTP (Tríplice bacteriana)", DoseLabel = "2º Reforço", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 48, DiseasesPrevented = "Difteria, tétano e coqueluche", Status = "Pending" },
        new() { Code = "VOP_REF2", Name = "Poliomielite 1 e 3 (atenuada) - VOP", DoseLabel = "2º Reforço", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 48, DiseasesPrevented = "Poliomielite", Status = "Pending" },
        new() { Code = "FEBRE_AMARELA_REF", Name = "Febre Amarela (atenuada)", DoseLabel = "Reforço", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 48, DiseasesPrevented = "Febre amarela", Status = "Pending" },
        new() { Code = "VARICELA_4A", Name = "Varicela (monovalente)", DoseLabel = "1ª Dose / Reforço", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 48, DiseasesPrevented = "Varicela (catapora)", Status = "Pending" },
        new() { Code = "PNEUMO23_5A", Name = "Pneumocócica 23-valente (Povos indígenas)", DoseLabel = "Dose única", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 60, DiseasesPrevented = "Infecções graves pelo pneumococo (povos indígenas ≥5a)", Status = "Pending" },
        new() { Code = "HPV_1", Name = "HPV (Papilomavírus humano)", DoseLabel = "1ª Dose (Meninas 9-14a)", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 108, DiseasesPrevented = "Câncer do colo do útero, vulva, vagina, ânus e verrugas genitais", Status = "Pending" },
        new() { Code = "HPV_2", Name = "HPV (Papilomavírus humano)", DoseLabel = "2ª Dose (6m após 1ª)", AgeGroupSection = "A partir de 12 meses", RecommendedMonth = 114, DiseasesPrevented = "Câncer do colo do útero, vulva, vagina, ânus e verrugas genitais", Status = "Pending" }
    ];

    public static List<RoutineConsultationRecord> CreateDefaultConsultations(DateTime birthDate, int ageDays) =>
    [
        new()
        {
            Code = "1_SEMANA",
            Title = "Consulta da 1ª Semana (3º ao 5º dia)",
            RecommendedAgeLabel = "3º ao 5º dia de vida",
            PageReference = "p. 71",
            Completed = ageDays >= 7,
            ConsultationDate = ageDays >= 7 ? birthDate.AddDays(5) : null,
            FeedingType = "Aleitamento materno exclusivo",
            AlertSigns =
            [
                new() { Label = "Baixo peso ao nascer (<2.500 g)" },
                new() { Label = "Prematuridade (<37 semanas)" },
                new() { Label = "Icterícia precoce (nas primeiras 24h) ou espalhada pelo corpo" },
                new() { Label = "Pele com lesões / albinismo" },
                new() { Label = "Diarreia ou vômitos" },
                new() { Label = "Dificuldade para respirar (FR <30 ou >60 irpm)" },
                new() { Label = "Febre (≥37,5°C) ou hipotermia (<36,5°C)" },
                new() { Label = "Secreção purulenta no olho, umbigo ou pele" },
                new() { Label = "Sangramentos ou palidez intensa" },
                new() { Label = "Fezes claras (esbranquiçadas/acinzentadas - escala 6, 7 ou 8)" },
                new() { Label = "Choro excessivo ou irritabilidade extrema" }
            ]
        },
        new()
        {
            Code = "1_MES",
            Title = "Consulta do 1º Mês",
            RecommendedAgeLabel = "1 mês",
            PageReference = "p. 72",
            Completed = ageDays >= 35,
            ConsultationDate = ageDays >= 35 ? birthDate.AddDays(30) : null,
            FeedingType = "Aleitamento materno exclusivo",
            AlertSigns =
            [
                new() { Label = "Icterícia persistente (após 2 semanas de vida)" },
                new() { Label = "Fezes esbranquiçadas / acolia fecal (suspeita de atresia de vias biliares)" },
                new() { Label = "Ganho de peso insuficiente (<20g/dia)" },
                new() { Label = "Vômitos frequentes ou recusa alimentar" },
                new() { Label = "Letargia ou hipoatividade" }
            ]
        },
        new()
        {
            Code = "2_MESES",
            Title = "Consulta do 2º Mês",
            RecommendedAgeLabel = "2 meses",
            PageReference = "p. 72",
            Completed = ageDays >= 65,
            ConsultationDate = ageDays >= 65 ? birthDate.AddDays(60) : null,
            FeedingType = "Aleitamento materno exclusivo",
            AlertSigns =
            [
                new() { Label = "Ausência de sorriso social ou contato visual" },
                new() { Label = "Dificuldade respiratória / tiragem subcostal" },
                new() { Label = "Diarreia ou sinais de desidratação" },
                new() { Label = "Convulsões ou movimentos anormais" }
            ]
        },
        new()
        {
            Code = "4_MESES",
            Title = "Consulta do 4º Mês",
            RecommendedAgeLabel = "4 meses",
            PageReference = "p. 73",
            Completed = ageDays >= 125,
            ConsultationDate = ageDays >= 125 ? birthDate.AddDays(120) : null,
            FeedingType = "Aleitamento materno exclusivo",
            AlertSigns =
            [
                new() { Label = "Não sustenta a cabeça aos 4 meses" },
                new() { Label = "Estrabismo persistente ou ausência de seguimento visual" },
                new() { Label = "Não reage a sons ou à voz materna/paterna" },
                new() { Label = "Desaceleração nas curvas de crescimento" }
            ]
        },
        new()
        {
            Code = "6_MESES",
            Title = "Consulta do 6º Mês",
            RecommendedAgeLabel = "6 meses",
            PageReference = "p. 73-74",
            Completed = ageDays >= 185,
            ConsultationDate = ageDays >= 185 ? birthDate.AddDays(180) : null,
            FeedingType = "Aleitamento materno complementado",
            AlertSigns =
            [
                new() { Label = "Dificuldade na introdução alimentar complementar" },
                new() { Label = "Não rola / não busca objetos ativamente" },
                new() { Label = "Sinais de anemia ou palidez palmar" },
                new() { Label = "Infecções respiratórias ou diarreicas de repetição" }
            ]
        },
        new()
        {
            Code = "9_MESES",
            Title = "Consulta do 9º Mês",
            RecommendedAgeLabel = "9 meses",
            PageReference = "p. 74",
            Completed = false,
            FeedingType = "Aleitamento materno complementado",
            AlertSigns =
            [
                new() { Label = "Não senta sem apoio" },
                new() { Label = "Não transfere objetos de uma mão para outra" },
                new() { Label = "Não balbucia sílabas nem brinca de esconde-achou" },
                new() { Label = "Exposição precoce a telas / alimentos ultraprocessados" }
            ]
        },
        new()
        {
            Code = "12_MESES",
            Title = "Consulta do 12º Mês (1 Ano)",
            RecommendedAgeLabel = "12 meses",
            PageReference = "p. 75",
            Completed = false,
            FeedingType = "Aleitamento materno complementado",
            AlertSigns =
            [
                new() { Label = "Não faz pinça nem aponta para mostrar ou pedir" },
                new() { Label = "Não anda com apoio" },
                new() { Label = "Ausência de primeiras palavras com significado" },
                new() { Label = "Manchas brancas ou cárie nos primeiros dentes" }
            ]
        },
        new()
        {
            Code = "18_MESES",
            Title = "Consulta do 18º Mês (1 Ano e Meio)",
            RecommendedAgeLabel = "18 meses",
            PageReference = "p. 75",
            Completed = false,
            FeedingType = "Alimentação da família + Leite materno",
            AlertSigns =
            [
                new() { Label = "Não anda sem apoio aos 18 meses" },
                new() { Label = "Sinais de alerta para TEA no M-CHAT-R/F (16 a 30m)" },
                new() { Label = "Perda de habilidades já adquiridas em qualquer idade" },
                new() { Label = "Baixo interesse em interagir ou brincar de faz de conta" }
            ]
        },
        new()
        {
            Code = "24_MESES",
            Title = "Consulta do 24º Mês (2 Anos)",
            RecommendedAgeLabel = "24 meses",
            PageReference = "p. 76",
            Completed = false,
            FeedingType = "Alimentação saudável da família",
            AlertSigns =
            [
                new() { Label = "Não fala frases curtas de 2 palavras" },
                new() { Label = "Risco de sobrepeso/obesidade ou magreza acentuada" },
                new() { Label = "Uso excessivo de telas (>1h/dia após os 2 anos)" },
                new() { Label = "Acidentes domésticos ou sinais de violência/negligência" }
            ]
        },
        new()
        {
            Code = "36_MESES",
            Title = "Consulta do 36º Mês (3 Anos)",
            RecommendedAgeLabel = "36 meses",
            PageReference = "p. 76",
            Completed = false,
            FeedingType = "Alimentação saudável da família",
            AlertSigns =
            [
                new() { Label = "Fala incompreensível para pessoas fora do convívio familiar" },
                new() { Label = "Alteração na aferição obrigatória da Pressão Arterial (PA)" },
                new() { Label = "Dificuldade de socialização com outras crianças na educação infantil" },
                new() { Label = "Alterações visuais ou auditivas percebidas pela família/escola" }
            ]
        }
    ];

    public static List<SurveillanceCheckItem> CreateDefaultRiskFactors(Baby baby) =>
    [
        new() { Code = "RF_01", Label = "Ausência ou pré-natal incompleto", Present = false },
        new() { Code = "RF_02", Label = "Problemas na gestação, parto ou nascimento", Present = false },
        new() { Code = "RF_03", Label = "Prematuridade (< 37 semanas)", Present = baby.GestationalWeeks < 37 },
        new() { Code = "RF_04", Label = "Peso abaixo de 2.500 g", Present = baby.BirthWeightGrams > 0 && baby.BirthWeightGrams < 2500 },
        new() { Code = "RF_05", Label = "Icterícia grave", Present = false },
        new() { Code = "RF_06", Label = "Hospitalização no período neonatal", Present = false },
        new() { Code = "RF_07", Label = "Doenças graves como meningite, traumatismo craniano ou convulsões", Present = false },
        new() { Code = "RF_08", Label = "Parentesco entre os pais", Present = false },
        new() { Code = "RF_09", Label = "Casos de deficiência ou doença mental na família", Present = false },
        new() { Code = "RF_10", Label = "Fatores de risco ambientais (violência doméstica, depressão materna, drogas/álcool, suspeita de abuso)", Present = false }
    ];

    public static List<SurveillanceCheckItem> CreateDefaultPhenotypicAlterations() =>
    [
        new() { Code = "PA_01", Label = "Fenda palpebral oblíqua", Present = false },
        new() { Code = "PA_02", Label = "Olhos afastados (hipertelorismo)", Present = false },
        new() { Code = "PA_03", Label = "Implantação baixa de orelhas", Present = false },
        new() { Code = "PA_04", Label = "Lábio leporino", Present = false },
        new() { Code = "PA_05", Label = "Fenda palatina", Present = false },
        new() { Code = "PA_06", Label = "Pescoço curto e/ou largo", Present = false },
        new() { Code = "PA_07", Label = "Prega palmar única", Present = false },
        new() { Code = "PA_08", Label = "5º dedo da mão curto e recurvado (clinodactilia)", Present = false }
    ];

    public static List<MChatRQuestionItem> CreateDefaultMChatRQuestions() =>
    [
        new() { Number = 1, QuestionText = "Se você apontar para algum objeto no quarto, a sua filha olha para este objeto?", ExampleText = "Por exemplo, se você apontar para um brinquedo ou animal, a sua filha olha para o brinquedo ou para o animal?", Answer = "Sim", ReverseScored = false },
        new() { Number = 2, QuestionText = "Alguma vez você se perguntou se a sua filha pode ser surda?", ExampleText = "Avalia reação auditiva consistente à voz e aos sons ambientais.", Answer = "Não", ReverseScored = true },
        new() { Number = 3, QuestionText = "A sua filha brinca de faz de conta?", ExampleText = "Por exemplo, faz de conta que bebe em um copo vazio, faz de conta que fala ao telefone ou faz de conta que dá comida a uma boneca ou a um bichinho de pelúcia?", Answer = "Sim", ReverseScored = false },
        new() { Number = 4, QuestionText = "A sua filha gosta de subir nas coisas?", ExampleText = "Por exemplo, móveis, brinquedos em parques ou escadas.", Answer = "Sim", ReverseScored = false },
        new() { Number = 5, QuestionText = "A sua filha faz movimentos estranhos com os dedos perto dos olhos?", ExampleText = "Por exemplo, mexe os dedos perto dos olhos de um modo estranho?", Answer = "Não", ReverseScored = true },
        new() { Number = 6, QuestionText = "A sua filha aponta com o dedo para pedir algo ou para conseguir ajuda?", ExampleText = "Por exemplo, aponta para um biscoito ou brinquedo fora do alcance dela?", Answer = "Sim", ReverseScored = false },
        new() { Number = 7, QuestionText = "A sua filha aponta com o dedo para lhe mostrar algo interessante?", ExampleText = "Por exemplo, aponta para um avião no céu ou um caminhão grande na estrada?", Answer = "Sim", ReverseScored = false },
        new() { Number = 8, QuestionText = "A sua filha se interessa por outras crianças?", ExampleText = "Por exemplo, a sua filha observa outras crianças, sorri para elas ou aproxima-se delas?", Answer = "Sim", ReverseScored = false },
        new() { Number = 9, QuestionText = "A sua filha mostra-lhe coisas, trazendo-as ou segurando-as para que você as veja — não para conseguir ajuda, mas apenas para compartilhar?", ExampleText = "Por exemplo, mostra uma flor, um bichinho de pelúcia ou um caminhão de brinquedo?", Answer = "Sim", ReverseScored = false },
        new() { Number = 10, QuestionText = "A sua filha responde quando você a chama pelo nome?", ExampleText = "Por exemplo, ela olha, fala ou balbucia ou para o que está fazendo quando você a chama pelo nome?", Answer = "Sim", ReverseScored = false },
        new() { Number = 11, QuestionText = "Quando você sorri para a sua filha, ela sorri de volta para você?", ExampleText = "Avalia reciprocidade socioemocional.", Answer = "Sim", ReverseScored = false },
        new() { Number = 12, QuestionText = "A sua filha fica muito incomodada com barulhos do dia a dia?", ExampleText = "Por exemplo, a sua filha grita ou chora com barulhos como o do aspirador ou de música alta?", Answer = "Não", ReverseScored = true },
        new() { Number = 13, QuestionText = "A sua filha anda?", ExampleText = "Marcha independente.", Answer = "Sim", ReverseScored = false },
        new() { Number = 14, QuestionText = "A sua filha olha você nos olhos quando você fala com ela, brinca com ela ou a veste?", ExampleText = "Avalia contato visual sustentado nas interações cotidianas.", Answer = "Sim", ReverseScored = false },
        new() { Number = 15, QuestionText = "A sua filha tenta imitar aquilo que você faz?", ExampleText = "Por exemplo, dá tchau, bate palmas ou faz um barulho engraçado quando você o faz?", Answer = "Sim", ReverseScored = false },
        new() { Number = 16, QuestionText = "Se você virar a sua cabeça para olhar para alguma coisa, a sua filha olha em volta para ver o que é que você está olhando?", ExampleText = "Avalia atenção compartilhada guiada pelo olhar.", Answer = "Sim", ReverseScored = false },
        new() { Number = 17, QuestionText = "A sua filha busca fazer com que você olhe para ela?", ExampleText = "Por exemplo, a sua filha olha para você para ser elogiada ou diz 'olha' ou 'olha para mim'?", Answer = "Sim", ReverseScored = false },
        new() { Number = 18, QuestionText = "A sua filha compreende quando você lhe diz para fazer alguma coisa?", ExampleText = "Por exemplo, se você não apontar, a sua filha compreende 'ponha o livro na cadeira' ou 'traga o cobertor para mim'?", Answer = "Sim", ReverseScored = false },
        new() { Number = 19, QuestionText = "Se acontecer alguma coisa nova, a sua filha olha para o seu rosto para ver como você reage?", ExampleText = "Por exemplo, se ela ouve um barulho estranho ou engraçado, ou vê um brinquedo novo, ela olha para o seu rosto?", Answer = "Sim", ReverseScored = false },
        new() { Number = 20, QuestionText = "A sua filha gosta de atividades com movimento?", ExampleText = "Por exemplo, ser balançada ou pular nos seus joelhos?", Answer = "Sim", ReverseScored = false }
    ];

    public static List<ToothEruptionGroup> CreateDefaultToothEruptionGroups() =>
    [
        new() { Code = "ICI", GroupName = "Incisivo central inferior", Arch = "Inferior", ExpectedMonthsRange = "6 a 10 meses" },
        new() { Code = "ICS", GroupName = "Incisivo central superior", Arch = "Superior", ExpectedMonthsRange = "8 a 12 meses" },
        new() { Code = "ILS", GroupName = "Incisivo lateral superior", Arch = "Superior", ExpectedMonthsRange = "9 a 13 meses" },
        new() { Code = "ILI", GroupName = "Incisivo lateral inferior", Arch = "Inferior", ExpectedMonthsRange = "10 a 16 meses" },
        new() { Code = "1MI", GroupName = "Primeiro molar inferior", Arch = "Inferior", ExpectedMonthsRange = "14 a 18 meses" },
        new() { Code = "1MS", GroupName = "Primeiro molar superior", Arch = "Superior", ExpectedMonthsRange = "13 a 19 meses" },
        new() { Code = "CI", GroupName = "Canino inferior", Arch = "Inferior", ExpectedMonthsRange = "17 a 23 meses" },
        new() { Code = "CS", GroupName = "Canino superior", Arch = "Superior", ExpectedMonthsRange = "16 a 22 meses" },
        new() { Code = "2MI", GroupName = "Segundo molar inferior", Arch = "Inferior", ExpectedMonthsRange = "23 a 31 meses" },
        new() { Code = "2MS", GroupName = "Segundo molar superior", Arch = "Superior", ExpectedMonthsRange = "25 a 33 meses" }
    ];

    public static List<DeciduousToothItem> CreateDefaultOdontogramTeeth() =>
    [
        new() { Code = "55", Name = "2º Molar Sup. Direito", Arch = "Superior", Side = "Direito", Status = "Normal" },
        new() { Code = "54", Name = "1º Molar Sup. Direito", Arch = "Superior", Side = "Direito", Status = "Normal" },
        new() { Code = "53", Name = "Canino Sup. Direito", Arch = "Superior", Side = "Direito", Status = "Normal" },
        new() { Code = "52", Name = "Incisivo Lateral Sup. Direito", Arch = "Superior", Side = "Direito", Status = "Normal" },
        new() { Code = "51", Name = "Incisivo Central Sup. Direito", Arch = "Superior", Side = "Direito", Status = "Normal" },
        new() { Code = "61", Name = "Incisivo Central Sup. Esquerdo", Arch = "Superior", Side = "Esquerdo", Status = "Normal" },
        new() { Code = "62", Name = "Incisivo Lateral Sup. Esquerdo", Arch = "Superior", Side = "Esquerdo", Status = "Normal" },
        new() { Code = "63", Name = "Canino Sup. Esquerdo", Arch = "Superior", Side = "Esquerdo", Status = "Normal" },
        new() { Code = "64", Name = "1º Molar Sup. Esquerdo", Arch = "Superior", Side = "Esquerdo", Status = "Normal" },
        new() { Code = "65", Name = "2º Molar Sup. Esquerdo", Arch = "Superior", Side = "Esquerdo", Status = "Normal" },
        new() { Code = "85", Name = "2º Molar Inf. Direito", Arch = "Inferior", Side = "Direito", Status = "Normal" },
        new() { Code = "84", Name = "1º Molar Inf. Direito", Arch = "Inferior", Side = "Direito", Status = "Normal" },
        new() { Code = "83", Name = "Canino Inf. Direito", Arch = "Inferior", Side = "Direito", Status = "Normal" },
        new() { Code = "82", Name = "Incisivo Lateral Inf. Direito", Arch = "Inferior", Side = "Direito", Status = "Normal" },
        new() { Code = "81", Name = "Incisivo Central Inf. Direito", Arch = "Inferior", Side = "Direito", Status = "Normal" },
        new() { Code = "71", Name = "Incisivo Central Inf. Esquerdo", Arch = "Inferior", Side = "Esquerdo", Status = "Normal" },
        new() { Code = "72", Name = "Incisivo Lateral Inf. Esquerdo", Arch = "Inferior", Side = "Esquerdo", Status = "Normal" },
        new() { Code = "73", Name = "Canino Inf. Esquerdo", Arch = "Inferior", Side = "Esquerdo", Status = "Normal" },
        new() { Code = "74", Name = "1º Molar Inf. Esquerdo", Arch = "Inferior", Side = "Esquerdo", Status = "Normal" },
        new() { Code = "75", Name = "2º Molar Inf. Esquerdo", Arch = "Inferior", Side = "Esquerdo", Status = "Normal" }
    ];

    public static List<VitaminADoseEntry> CreateDefaultVitaminADoses() =>
    [
        new() { SlotNumber = 1, AgePeriodLabel = "1ª Dose (6 a 11 meses - 100.000 UI)" },
        new() { SlotNumber = 2, AgePeriodLabel = "2ª Dose (12 a 17 meses - 200.000 UI)" },
        new() { SlotNumber = 3, AgePeriodLabel = "3ª Dose (18 a 23 meses - 200.000 UI)" },
        new() { SlotNumber = 4, AgePeriodLabel = "4ª Dose (24 a 29 meses - 200.000 UI)" },
        new() { SlotNumber = 5, AgePeriodLabel = "5ª Dose (30 a 35 meses - 200.000 UI)" },
        new() { SlotNumber = 6, AgePeriodLabel = "6ª Dose (36 a 41 meses - 200.000 UI)" },
        new() { SlotNumber = 7, AgePeriodLabel = "7ª Dose (42 a 47 meses - 200.000 UI)" },
        new() { SlotNumber = 8, AgePeriodLabel = "8ª Dose (48 a 53 meses - 200.000 UI)" },
        new() { SlotNumber = 9, AgePeriodLabel = "9ª Dose (54 a 59 meses - 200.000 UI)" }
    ];

    public static List<MilestoneProgress> CreateInitialMilestones(string babyId, string ownerUserId)
    {
        var list = new List<MilestoneProgress>
        {
            // 11 Marcos Motores (compatibilidade total com rotina-do-bebe)
            new() { OwnerUserId = ownerUserId, BabyId = babyId, MilestoneCode = "MOTOR_02_04M_HEAD_CONTROL", Title = "Sustentação firme da cabeça em posição prona (Tummy Time)", Description = "Controle cervical firme elevando cabeça e tórax apoiado nos antebraços.", DirectionType = "Cephalocaudal", ExpectedAgeMonths = 3, RedFlagMonthLimit = 4, AgeRangeLabel = "2 a 4 meses", AgeRangeGroup = "0 a 6 meses", Status = "NotStarted", OfficialCode = "NV" },
            new() { OwnerUserId = ownerUserId, BabyId = babyId, MilestoneCode = "MOTOR_02_04M_HANDS_OPEN_REACH", Title = "Abertura das mãos, alcance inicial de objetos e sorriso social", Description = "Fixação visual, sorriso responsivo e abertura espontânea dos punhos para tocar brinquedos.", DirectionType = "Proximodistal", ExpectedAgeMonths = 3, RedFlagMonthLimit = 4, AgeRangeLabel = "2 a 4 meses", AgeRangeGroup = "0 a 6 meses", Status = "NotStarted", OfficialCode = "NV" },
            new() { OwnerUserId = ownerUserId, BabyId = babyId, MilestoneCode = "MOTOR_06M_SITTING_MIN_SUPPORT", Title = "Controle de tronco para sentar-se com apoio mínimo", Description = "Prontidão postural essencial para início seguro da introdução alimentar.", DirectionType = "Cephalocaudal", ExpectedAgeMonths = 6, RedFlagMonthLimit = 8, AgeRangeLabel = "6 meses", AgeRangeGroup = "6 a 18 meses", Status = "NotStarted", OfficialCode = "NV" },
            new() { OwnerUserId = ownerUserId, BabyId = babyId, MilestoneCode = "MOTOR_06M_BILATERAL_ROLLING", Title = "Rolamento bilateral completo (supino ↔ prono)", Description = "Rola de barriga para cima para barriga para baixo e vice-versa com dissociação de cinturas.", DirectionType = "Cephalocaudal", ExpectedAgeMonths = 6, RedFlagMonthLimit = 7, AgeRangeLabel = "6 meses", AgeRangeGroup = "0 a 6 meses", Status = "NotStarted", OfficialCode = "NV" },
            new() { OwnerUserId = ownerUserId, BabyId = babyId, MilestoneCode = "MOTOR_06M_OBJECT_TRANSFER", Title = "Transferência de objetos de uma mão para a outra", Description = "Coordenação bimanual na linha média.", DirectionType = "Proximodistal", ExpectedAgeMonths = 6, RedFlagMonthLimit = 9, AgeRangeLabel = "6 meses", AgeRangeGroup = "6 a 18 meses", Status = "NotStarted", OfficialCode = "NV" },
            new() { OwnerUserId = ownerUserId, BabyId = babyId, MilestoneCode = "MOTOR_09_12M_SITTING_NO_SUPPORT", Title = "Permanência sentado sem apoio e engatinhar", Description = "Sentar independente com mãos livres para brincar e locomoção em quatro apoios.", DirectionType = "Cephalocaudal", ExpectedAgeMonths = 9, RedFlagMonthLimit = 10, AgeRangeLabel = "9 a 12 meses", AgeRangeGroup = "6 a 18 meses", Status = "NotStarted", OfficialCode = "NV" },
            new() { OwnerUserId = ownerUserId, BabyId = babyId, MilestoneCode = "MOTOR_09_12M_PULL_TO_STAND", Title = "Puxar o corpo para posição bípede apoiado em mobília", Description = "Traciona os membros superiores para ficar em pé segurando no sofá ou grade do berço.", DirectionType = "Cephalocaudal", ExpectedAgeMonths = 10, RedFlagMonthLimit = 12, AgeRangeLabel = "9 a 12 meses", AgeRangeGroup = "6 a 18 meses", Status = "NotStarted", OfficialCode = "NV" },
            new() { OwnerUserId = ownerUserId, BabyId = babyId, MilestoneCode = "MOTOR_09_12M_PINCER_GRASP", Title = "Pinça fina (uso opositor do polegar e indicador)", Description = "Pega pequenos pedaços de alimento (como grãos de feijão ou ervilha) com precisão.", DirectionType = "Proximodistal", ExpectedAgeMonths = 10, RedFlagMonthLimit = 12, AgeRangeLabel = "9 a 12 meses", AgeRangeGroup = "6 a 18 meses", Status = "NotStarted", OfficialCode = "NV" },
            new() { OwnerUserId = ownerUserId, BabyId = babyId, MilestoneCode = "MOTOR_12_15M_FIRST_STEPS", Title = "Primeiros passos independentes e soltura intencional de objetos", Description = "Marcha inicial com passos curtos e base alargada; coloca e solta blocos dentro de potes.", DirectionType = "Cephalocaudal", ExpectedAgeMonths = 13, RedFlagMonthLimit = 15, AgeRangeLabel = "12 a 15 meses", AgeRangeGroup = "6 a 18 meses", Status = "NotStarted", OfficialCode = "NV" },
            new() { OwnerUserId = ownerUserId, BabyId = babyId, MilestoneCode = "MOTOR_18M_STABLE_GAIT_TOWER", Title = "Marcha estável, subir degraus com auxílio e torre de 2 a 3 blocos", Description = "Aceleração do passo com equilíbrio e coordenação visuomotora fina para empilhar blocos.", DirectionType = "Proximodistal", ExpectedAgeMonths = 18, RedFlagMonthLimit = 20, AgeRangeLabel = "18 meses", AgeRangeGroup = "18 a 42 meses", Status = "NotStarted", OfficialCode = "NV" },
            new() { OwnerUserId = ownerUserId, BabyId = babyId, MilestoneCode = "MOTOR_24M_RUN_KICK_CUTLERY", Title = "Corrida coordenada, chute de bola e uso funcional de talheres", Description = "Sobe/desce escadas segurando no corrimão, chuta bola sem perder o equilíbrio e usa colher/garfo à mesa.", DirectionType = "Cephalocaudal", ExpectedAgeMonths = 24, RedFlagMonthLimit = 28, AgeRangeLabel = "24 meses (2 anos)", AgeRangeGroup = "18 a 42 meses", Status = "NotStarted", OfficialCode = "NV" },

            // Todos os 52 Marcos Oficiais da Vigilância do Desenvolvimento Infantil (Páginas 81 a 85 da Caderneta da Criança - 5ª Ed.)
            // FAIXA 1: 0 A 6 MESES (Página 81 — Marcos 1 a 16)
            CreateCadernetaMilestone(babyId, ownerUserId, 1, "CAD_01", "Postura: barriga para cima, pernas e braços fletidos, cabeça lateralizada", "0 a 6 meses", "0 a 1 mês", 0, 1, "Deite a criança em superfície plana, de costas; observe se seus braços e pernas ficam flexionados e sua cabeça lateralizada."),
            CreateCadernetaMilestone(babyId, ownerUserId, 2, "CAD_02", "Observa um rosto", "0 a 6 meses", "0 a 1 mês", 0, 1, "Posicione seu rosto a aproximadamente 30 cm acima do rosto da criança e observe se ela olha para você, de forma evidente."),
            CreateCadernetaMilestone(babyId, ownerUserId, 3, "CAD_03", "Reage ao som", "0 a 6 meses", "0 a 1 mês", 0, 1, "Bata palma ou balance um chocalho a cerca de 30 cm de cada orelha da criança e observe se ela reage com movimento nos olhos ou mudança da expressão facial."),
            CreateCadernetaMilestone(babyId, ownerUserId, 4, "CAD_04", "Eleva a cabeça", "0 a 6 meses", "0 a 1 mês", 0, 1, "Posicione a criança de bruços e observe se ela levanta a cabeça, desencostando o queixo da superfície, sem virar para um dos lados."),
            CreateCadernetaMilestone(babyId, ownerUserId, 5, "CAD_05", "Sorriso social quando estimulada", "0 a 6 meses", "1 a 2 meses", 1, 2, "Sorria e converse com a criança; não lhe faça cócegas nem toque sua face. Observe se ela responde com um sorriso."),
            CreateCadernetaMilestone(babyId, ownerUserId, 6, "CAD_06", "Abre as mãos", "0 a 6 meses", "1 a 2 meses", 1, 2, "Observe se em alguns momentos a criança abre as mãos espontaneamente."),
            CreateCadernetaMilestone(babyId, ownerUserId, 7, "CAD_07", "Emite sons", "0 a 6 meses", "1 a 2 meses", 1, 2, "Observe se a criança emite algum som que não seja choro. Caso não seja observado, pergunte a quem a acompanha se ela faz isso em casa."),
            CreateCadernetaMilestone(babyId, ownerUserId, 8, "CAD_08", "Movimenta ativamente os membros", "0 a 6 meses", "1 a 2 meses", 1, 2, "Observe se a criança movimenta ativamente os membros superiores e inferiores simetricamente."),
            CreateCadernetaMilestone(babyId, ownerUserId, 9, "CAD_09", "Responde ativamente ao contato social", "0 a 6 meses", "2 a 4 meses", 2, 4, "Fique à frente do bebê e converse com ele. Observe se ele responde com sorriso e emissão de sons como se 'conversasse' com você."),
            CreateCadernetaMilestone(babyId, ownerUserId, 10, "CAD_10", "Segura objetos", "0 a 6 meses", "2 a 4 meses", 2, 4, "Ofereça um objeto tocando no dorso da mão ou dedos da criança. Esta deverá abrir as mãos e segurar o objeto pelo menos por alguns segundos."),
            CreateCadernetaMilestone(babyId, ownerUserId, 11, "CAD_11", "Emite sons, ri alto", "0 a 6 meses", "2 a 4 meses", 2, 4, "Fique à frente da criança, converse com ela e observe se ela emite sons (gugu, eee, etc.) e dá risada."),
            CreateCadernetaMilestone(babyId, ownerUserId, 12, "CAD_12", "Levanta a cabeça e apoia-se nos antebraços, de bruços", "0 a 6 meses", "2 a 4 meses", 2, 4, "Coloque a criança de bruços, numa superfície firme. Chame sua atenção à frente com objetos ou seu rosto e observe se ela levanta a cabeça apoiando-se nos antebraços."),
            CreateCadernetaMilestone(babyId, ownerUserId, 13, "CAD_13", "Busca ativa de objetos", "0 a 6 meses", "4 a 6 meses", 4, 6, "Coloque um objeto ao alcance da criança (sobre a mesa ou na palma de sua mão) chamando sua atenção para o mesmo. Observe se ela tenta alcançá-lo."),
            CreateCadernetaMilestone(babyId, ownerUserId, 14, "CAD_14", "Leva objetos à boca", "0 a 6 meses", "4 a 6 meses", 4, 6, "Entregue um objeto na mão da criança e observe se ela o leva à boca."),
            CreateCadernetaMilestone(babyId, ownerUserId, 15, "CAD_15", "Localiza o som", "0 a 6 meses", "4 a 6 meses", 4, 6, "Faça um barulho suave (sino, chocalho etc.) próximo à orelha da criança, fora do seu campo visual, e observe se ela vira a cabeça em direção ao objeto que produziu o som. Repita no lado oposto."),
            CreateCadernetaMilestone(babyId, ownerUserId, 16, "CAD_16", "Muda de posição ativamente (rola)", "0 a 6 meses", "4 a 6 meses", 4, 6, "Coloque a criança em superfície plana de barriga para cima. Incentive-a a virar para a posição de bruços. Pergunte a quem a acompanha se ela faz isso em casa."),

            // FAIXA 2: 6 A 18 MESES (Página 82 — Marcos 17 a 32)
            CreateCadernetaMilestone(babyId, ownerUserId, 17, "CAD_17", "Brinca de esconde-achou", "6 a 18 meses", "6 a 9 meses", 6, 9, "Coloque-se à frente da criança e brinque de desaparecer e aparecer atrás de um pano ou atrás da mãe/pai."),
            CreateCadernetaMilestone(babyId, ownerUserId, 18, "CAD_18", "Transfere objetos de uma mão para a outra", "6 a 18 meses", "6 a 9 meses", 6, 9, "Ofereça um objeto para a criança segurar. Observe se ela o transfere de uma mão para a outra."),
            CreateCadernetaMilestone(babyId, ownerUserId, 19, "CAD_19", "Duplica sílabas", "6 a 18 meses", "6 a 9 meses", 6, 9, "Observe se a criança fala 'papa', 'dada', 'mama'. Caso não o faça, pergunte a quem a acompanha se ela o faz em casa."),
            CreateCadernetaMilestone(babyId, ownerUserId, 20, "CAD_20", "Senta-se sem apoio", "6 a 18 meses", "6 a 9 meses", 6, 9, "Coloque a criança numa superfície firme, dê-lhe um objeto para ela segurar e observe se ela fica sentada sem o apoio das mãos para se equilibrar."),
            CreateCadernetaMilestone(babyId, ownerUserId, 21, "CAD_21", "Imita gestos", "6 a 18 meses", "9 a 12 meses", 9, 12, "Faça algum gesto conhecido pela criança como bater palmas ou dar tchau e observe se ela o imita."),
            CreateCadernetaMilestone(babyId, ownerUserId, 22, "CAD_22", "Faz pinça", "6 a 18 meses", "9 a 12 meses", 9, 12, "Coloque próximo à criança uma jujuba ou uma bolinha de papel. Observe se ao pegá-la ela usa o movimento de pinça (polegar + indicador)."),
            CreateCadernetaMilestone(babyId, ownerUserId, 23, "CAD_23", "Produz 'jargão'", "6 a 18 meses", "9 a 12 meses", 9, 12, "Observe se a criança produz uma conversação incompreensível consigo mesma, com você ou com a mãe/pai (jargão)."),
            CreateCadernetaMilestone(babyId, ownerUserId, 24, "CAD_24", "Anda com apoio", "6 a 18 meses", "9 a 12 meses", 9, 12, "Observe se a criança consegue dar alguns passos apoiando-se em móveis ou nas mãos do examinador/cuidador."),
            CreateCadernetaMilestone(babyId, ownerUserId, 25, "CAD_25", "Mostra o que quer", "6 a 18 meses", "12 a 15 meses", 12, 15, "A criança indica o que quer sem que seja por meio do choro, podendo ser por meio de palavras ou sons, apontando ou estendendo a mão para alcançar."),
            CreateCadernetaMilestone(babyId, ownerUserId, 26, "CAD_26", "Coloca blocos na caneca", "6 a 18 meses", "12 a 15 meses", 12, 15, "Coloque 3 blocos e a caneca sobre a mesa. Estimule a criança a colocar os blocos dentro da caneca."),
            CreateCadernetaMilestone(babyId, ownerUserId, 27, "CAD_27", "Fala uma palavra", "6 a 18 meses", "12 a 15 meses", 12, 15, "Observe se durante o atendimento a criança diz pelo menos uma palavra que não seja 'mamãe', 'papai', ou o nome de algum membro da família."),
            CreateCadernetaMilestone(babyId, ownerUserId, 28, "CAD_28", "Anda sem apoio", "6 a 18 meses", "12 a 15 meses", 12, 15, "Observe se a criança já anda bem, com bom equilíbrio, sem se apoiar."),
            CreateCadernetaMilestone(babyId, ownerUserId, 29, "CAD_29", "Usa colher ou garfo", "6 a 18 meses", "15 a 18 meses", 15, 18, "Pergunte a quem acompanha a criança se ela é capaz de usar colher ou garfo para comer, mesmo que derrame um pouco."),
            CreateCadernetaMilestone(babyId, ownerUserId, 30, "CAD_30", "Constrói torre de 2 cubos", "6 a 18 meses", "15 a 18 meses", 15, 18, "Coloque 3 cubos sobre a mesa em frente à criança. Monte uma torre com dois cubos e peça a ela que faça igual."),
            CreateCadernetaMilestone(babyId, ownerUserId, 31, "CAD_31", "Fala 3 palavras", "6 a 18 meses", "15 a 18 meses", 15, 18, "Pergunte a quem acompanha a criança se ela diz três palavras que não sejam 'papai', 'mamãe', ou o nome de familiares."),
            CreateCadernetaMilestone(babyId, ownerUserId, 32, "CAD_32", "Anda para trás", "6 a 18 meses", "15 a 18 meses", 15, 18, "Peça à criança para abrir uma porta ou puxar um brinquedo por uma cordinha e verifique se ela dá passos para trás."),

            // FAIXA 3: 18 A 42 MESES (Página 83 — Marcos 33 a 48)
            CreateCadernetaMilestone(babyId, ownerUserId, 33, "CAD_33", "Tira roupa", "18 a 42 meses", "18 a 24 meses", 18, 24, "Observe se a criança é capaz de remover alguma peça de roupa, tais como sapatos, casacos, calças ou camisetas."),
            CreateCadernetaMilestone(babyId, ownerUserId, 34, "CAD_34", "Constrói torre de 3 cubos", "18 a 42 meses", "18 a 24 meses", 18, 24, "Coloque três cubos sobre a mesa em frente à criança. Estimule-a a empilhá-los."),
            CreateCadernetaMilestone(babyId, ownerUserId, 35, "CAD_35", "Aponta 2 figuras", "18 a 42 meses", "18 a 24 meses", 18, 24, "Mostre uma folha de papel com cinco figuras de elementos conhecidos (gato, cachorro, carro, flor e menina). Observe se aponta 2 de 5."),
            CreateCadernetaMilestone(babyId, ownerUserId, 36, "CAD_36", "Chuta bola", "18 a 42 meses", "18 a 24 meses", 18, 24, "Posicione uma bola a mais ou menos 15 cm da criança ou jogue a bola para ela. Verifique se ela chuta a bola sem apoiar-se."),
            CreateCadernetaMilestone(babyId, ownerUserId, 37, "CAD_37", "Veste-se com supervisão", "18 a 42 meses", "24 a 30 meses", 24, 30, "Pergunte a quem acompanha a criança se ela é capaz de vestir alguma peça do vestuário tais como calcinha, meias, sapatos, casaco."),
            CreateCadernetaMilestone(babyId, ownerUserId, 38, "CAD_38", "Constrói torre de 6 cubos", "18 a 42 meses", "24 a 30 meses", 24, 30, "Coloque 6 cubos sobre a mesa em frente à criança. Estimule-a a empilhá-los."),
            CreateCadernetaMilestone(babyId, ownerUserId, 39, "CAD_39", "Frases com 2 palavras", "18 a 42 meses", "24 a 30 meses", 24, 30, "Observe se a criança combina duas palavras formando uma frase com significado que indique uma ação ('quer leite', 'achou bola')."),
            CreateCadernetaMilestone(babyId, ownerUserId, 40, "CAD_40", "Pula com ambos os pés", "18 a 42 meses", "24 a 30 meses", 24, 30, "Peça à criança que pule com os dois pés juntos tirando os dois pés do chão ao mesmo tempo."),
            CreateCadernetaMilestone(babyId, ownerUserId, 41, "CAD_41", "Brinca com outras crianças", "18 a 42 meses", "30 a 36 meses", 30, 36, "Pergunte a quem acompanha a criança se ela participa de brincadeiras com outras crianças da mesma faixa etária."),
            CreateCadernetaMilestone(babyId, ownerUserId, 42, "CAD_42", "Imita linha vertical", "18 a 42 meses", "30 a 36 meses", 30, 36, "Faça uma linha vertical no papel e peça à criança para desenhar linhas como as que você fez."),
            CreateCadernetaMilestone(babyId, ownerUserId, 43, "CAD_43", "Reconhece 2 ações", "18 a 42 meses", "30 a 36 meses", 30, 36, "Mostre as figuras e pergunte: 'Quem mia?', 'Quem late?', 'Quem fala?', 'Quem galopa?'. Observe se aponta 2 de 5."),
            CreateCadernetaMilestone(babyId, ownerUserId, 44, "CAD_44", "Arremessa bola", "18 a 42 meses", "30 a 36 meses", 30, 36, "Verifique se ela arremessa a bola acima do nível dos braços ao alcance do examinador."),
            CreateCadernetaMilestone(babyId, ownerUserId, 45, "CAD_45", "Veste uma camiseta", "18 a 42 meses", "36 a 42 meses", 36, 42, "Pergunte aos acompanhantes se a criança é capaz de vestir sozinha uma camiseta."),
            CreateCadernetaMilestone(babyId, ownerUserId, 46, "CAD_46", "Move o polegar com mão fechada", "18 a 42 meses", "36 a 42 meses", 36, 42, "Demonstre o sinal de 'OK' (mão fechada e polegar para cima) e peça que faça da mesma maneira."),
            CreateCadernetaMilestone(babyId, ownerUserId, 47, "CAD_47", "Compreende 2 adjetivos", "18 a 42 meses", "36 a 42 meses", 36, 42, "Pergunte: 'O que você faz quando está com frio / cansada / com fome?'. Observe se responde coerentemente a 2 de 3."),
            CreateCadernetaMilestone(babyId, ownerUserId, 48, "CAD_48", "Equilibra-se em cada pé por 1 segundo", "18 a 42 meses", "36 a 42 meses", 36, 42, "Mostre como se equilibrar em um só pé sem apoiar-se em objetos por 1 segundo."),

            // FAIXA 4: 42 A 60 MESES (Página 84 — Marcos 49 a 51)
            CreateCadernetaMilestone(babyId, ownerUserId, 49, "CAD_49", "Emparelha cores / Copia círculo / Fala inteligível / Pula em um pé só", "42 a 60 meses", "42 a 48 meses", 42, 48, "Emparelha objetos da mesma cor, copia círculo, fala compreensível e pula em um pé só."),
            CreateCadernetaMilestone(babyId, ownerUserId, 50, "CAD_50", "Veste-se sem ajuda / Copia cruz / Compreende 4 preposições / Equilibra-se em cada pé por 3 segundos", "42 a 60 meses", "48 a 54 meses", 48, 54, "Veste-se sem ajuda, copia cruz, compreende ordens com 'em cima, embaixo, atrás, na frente' e equilibra-se por 3s."),
            CreateCadernetaMilestone(babyId, ownerUserId, 51, "CAD_51", "Escova os dentes sem ajuda / Aponta a linha mais comprida / Define 5 palavras / Equilibra-se em cada pé por 5 segundos", "42 a 60 meses", "54 a 60 meses", 54, 60, "Escova os dentes sem ajuda, aponta a linha mais comprida, define 5 palavras e equilibra-se por 5s."),

            // FAIXA 5: 60 A 72 MESES (Página 85 — Marco 52)
            CreateCadernetaMilestone(babyId, ownerUserId, 52, "CAD_52", "Aceita e segue regras de jogos / Desenha pessoa com 6 partes / Faz analogias / Marcha ponta-calcanhar", "60 a 72 meses", "60 a 72 meses", 60, 72, "Segue regras em jogos de mesa, desenha pessoa com 6 partes, completa analogias e caminha ponta-calcanhar.")
        };

        return list;
    }

    private static MilestoneProgress CreateCadernetaMilestone(
        string babyId,
        string ownerUserId,
        int number,
        string code,
        string title,
        string ageGroup,
        string targetInterval,
        int expectedMonthStart,
        int redFlagMonthLimit,
        string howToInvestigate)
    {
        return new MilestoneProgress
        {
            OwnerUserId = ownerUserId,
            BabyId = babyId,
            MilestoneCode = code,
            CadernetaNumber = number,
            Title = title,
            Description = howToInvestigate,
            HowToInvestigate = howToInvestigate,
            DirectionType = "CadernetaOficial",
            AgeRangeGroup = ageGroup,
            AgeRangeLabel = targetInterval,
            ExpectedAgeMonths = expectedMonthStart,
            RedFlagMonthLimit = redFlagMonthLimit,
            Status = "NotStarted",
            OfficialCode = "NV"
        };
    }
}
