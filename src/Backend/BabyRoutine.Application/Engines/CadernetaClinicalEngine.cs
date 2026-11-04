using BabyRoutine.Application.Common.Models;

namespace BabyRoutine.Application.Engines;

public static class CadernetaClinicalEngine
{
    /// <summary>
    /// Aplica a regra oficial de ajuste de 0,7 cm da página 88 da Caderneta da Criança (5ª ed.):
    /// - Até 2 anos (&lt; 730 dias): referência é deitada (comprimento). Se medida em pé, soma-se 0,7 cm.
    /// - 2 anos ou mais (&gt;= 730 dias): referência é em pé (estatura). Se medida deitada, subtrai-se 0,7 cm.
    /// </summary>
    public static double CalculateAdjustedHeightCm(double rawHeightCm, int ageDays, string? measuredPosition)
    {
        var pos = (measuredPosition ?? string.Empty).ToLowerInvariant();
        var isStanding = pos.Contains("pé") || pos.Contains("pe") || pos.Contains("standing") || pos.Contains("estatura");
        var isLying = pos.Contains("deitada") || pos.Contains("lying") || pos.Contains("comprimento");

        if (ageDays < 730 && isStanding)
        {
            return Math.Round(rawHeightCm + 0.7, 2);
        }

        if (ageDays >= 730 && isLying)
        {
            return Math.Round(rawHeightCm - 0.7, 2);
        }

        return Math.Round(rawHeightCm, 2);
    }

    public static double CalculateBmi(double weightGrams, double adjustedHeightCm)
    {
        var heightM = Math.Max(0.30, adjustedHeightCm / 100.0);
        var weightKg = weightGrams / 1000.0;
        return Math.Round(weightKg / (heightM * heightM), 2);
    }

    public static (double zWeight, double zHeight, double zHead, double zBmi) EstimateZScoresForGirl(
        int correctedAgeDays,
        double weightGrams,
        double adjustedHeightCm,
        double headCircumferenceCm,
        double bmi)
    {
        var ageMonths = correctedAgeDays / 30.4375;

        // Curvas aproximadas da OMS para Meninas (0 a 120 meses) para cálculo de Escore-z
        double expectedWeightGrams = ageMonths switch
        {
            <= 6 => 3200 + (ageMonths * 650),
            <= 12 => 7100 + ((ageMonths - 6) * 350),
            <= 24 => 9200 + ((ageMonths - 12) * 200),
            <= 60 => 11600 + ((ageMonths - 24) * 180),
            _ => 18080 + ((ageMonths - 60) * 230)
        };
        double sdWeight = Math.Max(450, expectedWeightGrams * 0.12);

        double expectedHeightCm = ageMonths switch
        {
            <= 6 => 49.1 + (ageMonths * 2.75),
            <= 12 => 65.6 + ((ageMonths - 6) * 1.4),
            <= 24 => 74.0 + ((ageMonths - 12) * 0.95),
            <= 60 => 85.4 + ((ageMonths - 24) * 0.65),
            _ => 108.8 + ((ageMonths - 60) * 0.52)
        };
        double sdHeight = ageMonths <= 24 ? 2.4 : 3.8;

        double expectedHeadCm = ageMonths switch
        {
            <= 6 => 33.9 + (ageMonths * 1.4),
            <= 12 => 42.3 + ((ageMonths - 6) * 0.45),
            _ => 45.0 + (Math.Min(12, ageMonths - 12) * 0.2)
        };
        double sdHead = 1.3;

        double expectedBmi = ageMonths switch
        {
            <= 6 => 13.4 + (ageMonths * 0.5),
            <= 12 => 16.4 - ((ageMonths - 6) * 0.08),
            <= 60 => 15.9 - ((ageMonths - 12) * 0.015),
            _ => 15.3 + ((ageMonths - 60) * 0.03)
        };
        double sdBmi = 1.25;

        var zWeight = Math.Round(Math.Clamp((weightGrams - expectedWeightGrams) / sdWeight, -4.0, 4.0), 2);
        var zHeight = Math.Round(Math.Clamp((adjustedHeightCm - expectedHeightCm) / sdHeight, -4.0, 4.0), 2);
        var zHead = Math.Round(Math.Clamp((headCircumferenceCm - expectedHeadCm) / sdHead, -4.0, 4.0), 2);
        var zBmi = Math.Round(Math.Clamp((bmi - expectedBmi) / sdBmi, -4.0, 4.0), 2);

        return (zWeight, zHeight, zHead, zBmi);
    }

    public static string ClassifyHeadCircumference(double zScore) => zScore switch
    {
        > 2.0 => "PC acima do esperado para a idade (> +2 / Macrocefalia)",
        < -2.0 => "PC abaixo do esperado para a idade (< -2 / Microcefalia)",
        _ => "PC adequado para a idade (-2 a +2)"
    };

    public static string ClassifyWeightForAge(double zScore) => zScore switch
    {
        > 2.0 => "Peso elevado para a idade (> +2)",
        >= -2.0 => "Peso adequado para a idade (-2 a +2)",
        >= -3.0 => "Peso baixo para a idade (-2 a -3)",
        _ => "Peso muito baixo para a idade (< -3)"
    };

    public static string ClassifyHeightForAge(double zScore) => zScore switch
    {
        >= -2.0 => "Comprimento/estatura adequado para a idade (>= -2)",
        >= -3.0 => "Comprimento/estatura baixo para a idade (-2 a -3)",
        _ => "Comprimento/estatura muito baixo para a idade (< -3)"
    };

    public static string ClassifyBmiForAge(double zScore, int ageDays)
    {
        var isOver5Years = ageDays >= 1825;
        if (isOver5Years)
        {
            return zScore switch
            {
                > 3.0 => "Obesidade grave (> +3)",
                > 2.0 => "Obesidade (+2 a +3)",
                > 1.0 => "Sobrepeso (+1 a +2)",
                >= -2.0 => "Adequado / Eutrofia (-2 a +1)",
                >= -3.0 => "Magreza (-2 a -3)",
                _ => "Magreza acentuada (< -3)"
            };
        }

        return zScore switch
        {
            > 3.0 => "Obesidade (> +3)",
            > 2.0 => "Sobrepeso (+2 a +3)",
            > 1.0 => "Risco de sobrepeso (+1 a +2)",
            >= -2.0 => "Adequado / Eutrofia (-2 a +1)",
            >= -3.0 => "Magreza (-2 a -3)",
            _ => "Magreza acentuada (< -3)"
        };
    }

    /// <summary>
    /// Instrumento de Avaliação do Desenvolvimento Integral da Criança (Página 80 da Caderneta da Criança)
    /// </summary>
    public static DevelopmentEvaluationSummary EvaluateIntegralDevelopment(
        Baby baby,
        List<MilestoneProgress> milestones)
    {
        var correctedAgeMonths = baby.GetCorrectedAgeDays() / 30;
        var phenotypicCount = baby.DevelopmentSurveillance?.PhenotypicAlterations?.Count(p => p.Present) ?? 0;
        var riskFactorsCount = baby.DevelopmentSurveillance?.RiskFactors?.Count(r => r.Present) ?? 0;

        var latestGrowth = baby.GrowthLogs.OrderByDescending(g => g.MeasuredAt).FirstOrDefault();
        var extremeHeadCircumference = latestGrowth != null && (latestGrowth.ZScoreHeadCircumference > 2.0 || latestGrowth.ZScoreHeadCircumference < -2.0);

        var absentPastMilestone = milestones.Any(m =>
            m.RedFlagMonthLimit <= correctedAgeMonths &&
            (m.OfficialCode == "A" || (m.Status != "Achieved" && m.OfficialCode != "P")));

        var absentCurrentMilestone = milestones.Any(m =>
            m.ExpectedAgeMonths <= correctedAgeMonths &&
            m.RedFlagMonthLimit > correctedAgeMonths &&
            m.OfficialCode == "A");

        if (absentPastMilestone || extremeHeadCircumference || phenotypicCount >= 3)
        {
            return new DevelopmentEvaluationSummary(
                Classification: "PROVÁVEL ATRASO NO DESENVOLVIMENTO",
                SeverityColor: "red",
                Reason: "Ausência de 1 ou mais marcos da faixa etária anterior, PC < -2 ou > +2 escores-z, ou presença de 3 ou mais alterações fenotípicas.",
                RecommendedConduct: "Acionar a rede de atenção à saúde para avaliação neuropsicomotora detalhada, investigação diagnóstica e intervenção precoce mantendo acompanhamento na Atenção Básica (p. 80)."
            );
        }

        if (absentCurrentMilestone || riskFactorsCount > 0)
        {
            return new DevelopmentEvaluationSummary(
                Classification: "ALERTA PARA O DESENVOLVIMENTO",
                SeverityColor: "amber",
                Reason: "Ausência de 1 ou mais marcos para a faixa etária atual ou presença de fator(es) de risco clínico/ambiental.",
                RecommendedConduct: "Orientar mãe/pai/responsáveis sobre estimulação com afeto (p. 37-52) e agendar retorno em 30 dias para reavaliação dos marcos (p. 80)."
            );
        }

        return new DevelopmentEvaluationSummary(
            Classification: "DESENVOLVIMENTO ADEQUADO",
            SeverityColor: "green",
            Reason: "Todos os marcos para a faixa etária estão presentes, sem fatores de risco ou alterações fenotípicas.",
            RecommendedConduct: "Elogiar a família, orientar para continuar estimulando a criança com afeto e retornar para acompanhamento conforme o calendário de consultas de rotina (p. 80)."
        );
    }

    /// <summary>
    /// Avaliação oficial do M-CHAT-R/F™ (Página 87 — Triagem de TEA entre 16 e 30 meses)
    /// </summary>
    public static MChatREvaluationResult EvaluateMChatR(List<MChatRQuestionItem> questions)
    {
        var riskScore = 0;
        var answeredCount = 0;
        var riskQuestionNumbers = new List<int>();

        foreach (var q in questions)
        {
            var ans = (q.Answer ?? string.Empty).Trim();
            if (ans is not ("Sim" or "Não")) continue;
            answeredCount++;

            var isRisk = q.ReverseScored ? ans == "Sim" : ans == "Não";
            if (isRisk)
            {
                riskScore++;
                riskQuestionNumbers.Add(q.Number);
            }
        }

        var (riskLevel, conduct) = riskScore switch
        {
            <= 2 => ("Baixo Risco (0 a 2 pontos)", "Se a criança tiver menos de 24 meses, repetir a triagem aos 24 meses. Manter vigilância habitual do desenvolvimento nas consultas recomendadas."),
            <= 7 => ("Risco Moderado (3 a 7 pontos)", "Realizar entrevista de seguimento (M-CHAT-R/F Follow-Up) para detalhar as respostas de risco. Caso o escore permaneça >= 2, encaminhar para avaliação diagnóstica e intervenção precoce."),
            _ => ("Alto Risco (8 a 20 pontos)", "Encaminhar imediatamente para avaliação diagnóstica multiprofissional e estimulação/intervenção precoce na Rede de Atenção à Saúde, mantendo acompanhamento conjunto na UBS (p. 47 e 87).")
        };

        return new MChatREvaluationResult(
            TotalQuestions: questions.Count,
            AnsweredQuestions: answeredCount,
            RiskScore: riskScore,
            RiskQuestionNumbers: riskQuestionNumbers,
            RiskClassification: riskLevel,
            RecommendedConduct: conduct
        );
    }
}

public record DevelopmentEvaluationSummary(
    string Classification,
    string SeverityColor,
    string Reason,
    string RecommendedConduct
);

public record MChatREvaluationResult(
    int TotalQuestions,
    int AnsweredQuestions,
    int RiskScore,
    List<int> RiskQuestionNumbers,
    string RiskClassification,
    string RecommendedConduct
);
