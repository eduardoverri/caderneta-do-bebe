# 📘 Caderneta do Bebê — Passaporte da Cidadania (5ª Edição - MS) & Gestão Inteligente de Rotina Pediátrica

Aplicação Web PWA completa (**Frontend Angular 19+ Standalone/Signals** e **Backend .NET 10 Minimal APIs + SignalR + MongoDB / Persistência Híbrida**) que une todas as automações e motores clínicos do sistema **Rotina do Bebê** com o registro, alteração e visualização integral de todos os dados, formulários, tabelas, curvas, checklists e orientações oficiais da **Caderneta da Criança — Menina — Passaporte da Cidadania (5ª edição, Ministério da Saúde, 2022)**.

---

## 🔐 Controle de Acesso por Usuário (Google SSO)

- **Criação Automática de Usuário via Conta Google**: O usuário é criado e autenticado exclusivamente a partir de uma conta Google via **Google SSO** (`POST /api/auth/google` suportando Google Identity Services OIDC `id_token`, OAuth 2.0 `access_token` ou `authorization_code`).
- **Isolamento Estrito por Usuário (`ownerUserId`)**: Todos os filhos/bebês, eventos de rotina, curvas antropométricas e registros da Caderneta da Criança pertencem ao usuário autenticado via JWT (`ClaimTypes.NameIdentifier`).

---

## ⚙️ Ações Automatizadas & Motores Clínicos (Paridade Total com `rotina-do-bebe`)

1. **`WakeWindowEngine`**: Cálculo dinâmico de janelas de vigília (*Sweet Spot*), idade cronológica vs. idade gestacional corrigida para prematuros (< 37 semanas) e prontidão para transição de sestas (`NapTransitionReadiness`).
2. **`MedicationSafetyEngine`**: Trava farmacológica contra sobredosagem com cálculo de dose máxima segura por peso (`mg/kg`), bloqueio temporal (`NextAllowedDoseAt`) e alerta de febre em menores de 3 meses (≥ 38,0 °C — pág. 62).
3. **`PediatricStoolClassifier`**: Classificação automática de fraldas pela Escala Pediátrica de Fezes, alerta de desidratação (< 4 fraldas molhadas em 24h) e triagem da Escala de Cor das Fezes (cores 1, 2 e 3 suspeitas de atresia biliar — pág. 19–20).
4. **`AllergenTrialEngine`**: Protocolo de monitoramento de 72 horas para introdução alimentar dos principais alérgenos (pág. 28–36).
5. **`CadernetaClinicalEngine`**:
   - Ajuste automático de **0,7 cm** entre comprimento (deitada, < 2 anos) e estatura (em pé, ≥ 2 anos) conforme pág. 88.
   - Cálculo de IMC (`Peso kg / Estatura² m`) e Escores-Z com classificações oficiais separadas para **0 a 5 anos** vs. **5 a 10 anos** (pág. 90 a 100).
   - **Instrumento de Avaliação do Desenvolvimento Integral da Criança** (*Desenvolvimento adequado*, *Alerta para o desenvolvimento* e *Provável atraso no desenvolvimento* — pág. 80).
   - **Calculadora Oficial M-CHAT-R/F™** (20 questões para triagem de Transtorno do Espectro do Autismo entre 16 e 30 meses, com pontuação reversa nas questões 2, 5 e 12 — pág. 87).

---

## 📖 Cobertura Integral da Caderneta da Criança (Páginas 1 a 112)

Todos os dados do bebê e ações da Caderneta podem ser **registrados, alterados (editados) e visualizados**:

- **Parte I — Para a Família e Cuidadores (pág. 4 a 66)**:
  - **Identificação da Criança (pág. 4)**: Foto, Nome, Data de Nascimento, Município, Filiação, Raça/Cor/Etnia, CPF, Cartão Nacional de Saúde (CNS), DNV, Certidão de Nascimento, Cartório, Número do Cadastro na UBS e Prontuário.
  - **Mudança de Endereço (pág. 5)**, **Dados da Assistência Social / Bolsa Família / Auxílio Brasil / BPC / CRAS (pág. 6–7)** e **Vida Escolar / Creche / Ensino Fundamental (pág. 8–9)**.
  - **Direitos da Criança e dos Pais (pág. 10–13)** e **Guias Ilustrados Oficiais (pág. 14–66)** com as 52 imagens oficiais integradas.
- **Parte II — Registros de Saúde da Criança (pág. 67 a 111)**:
  - **Pré-Natal, Parto, Nascimento e Vigilância de Infecções Congênitas (`A53` Sífilis, `B18` Hepatite B, `B58` Toxoplasmose, `Zika` — pág. 69)**.
  - **Triagens Neonatais e Alta da Maternidade (pág. 70–71)**: Teste do Reflexo Vermelho (Olhinho), Teste do Coraçãozinho (Oximetria de Pulso), Teste da Orelhinha (EOA/PEATE), Teste do Pezinho (6 doenças do PNTN) e Anotações Neonatais.
  - **10 Consultas Recomendadas do Nascimento aos 10 Anos (pág. 70–76)**: 1ª semana, 1 mês, 2 meses, 4 meses, 6 meses, 9 meses, 12 meses, 18 meses, 24 meses e 36 meses, mais **Pressão Arterial (PA — pág. 77)**.
  - **Vigilância do Desenvolvimento Infantil (pág. 78–87)**: Fatores de risco, alterações fenotípicas, **todos os 52 marcos oficiais (`P`, `A`, `NV`)**, desenvolvimento de 6 a 10 anos e **M-CHAT-R/F™ (20 questões)**.
  - **Vigilância do Crescimento Infantil (pág. 88–100)**: Registro, edição e exclusão de medidas, regra de 0,7 cm, RNPT e galeria com os **11 gráficos oficiais Intergrowth-21 e OMS**.
  - **Saúde Bucal (pág. 101–102)**: Cronologia de erupção, **Odontograma interativo dos 20 dentes decíduos** e consultas odontológicas.
  - **Suplementação (pág. 103)**: 9 megadoses de **Vitamina A** + **Ferro / NutriSUS**.
  - **Vacinação (pág. 104–106)**: Todas as **29 doses do Calendário Nacional de Vacinação** + **Outras Vacinas e Campanhas**.
  - **Anotações Gerais (pág. 107)** e **Agenda de Consultas e Atendimentos (pág. 108)**.

---

## 🚀 Como Executar

### 1. Backend (.NET 10)
```powershell
cd caderneta-do-bebe/src/Backend/BabyRoutine.Api
dotnet run
```

### 2. Testes Automatizados do Backend
```powershell
cd caderneta-do-bebe/src/Backend/BabyRoutine.Tests
dotnet test
```

### 3. Frontend (Angular 19+)
```powershell
cd caderneta-do-bebe/src/Frontend
npm install
npm start
```
