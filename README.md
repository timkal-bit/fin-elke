# 💰 Vermögensrechner - Technical Documentation

Detaillierte technische Dokumentation des React-basierten Finanzrechners mit allen Eingabefeldern, Berechnungsmodellen und Abhängigkeiten für Modelloptimierung.

![App Screenshot](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Vermögensrechner+Preview)

## � Eingabefelder & Datenmodell

### 🔄 Modi-Auswahl
| Feld | Typ | Standard | Beschreibung |
|------|-----|----------|--------------|
| `isRetirementMode` | Boolean | false | Toggle zwischen Anspar- und Ruhestandsmodus |
| `inheritanceEnabled` | Boolean | false | Aktiviert/deaktiviert Erbschaftsberücksichtigung |

### 👤 Ansparphase - Eingabefelder

#### Lebensdaten
| Feld | Typ | Standard | Range | Einheit | Verwendung |
|------|-----|----------|-------|---------|------------|
| `currentAge` | Number | 29 | 18-100 | Jahre | Startpunkt der Berechnung |
| `retirementAge` | Number | 69 | 50-100 | Jahre | Ende der Ansparphase |
| `lifeExpectancy` | Number | 95 | 60-120 | Jahre | Ende der Gesamtberechnung |

#### Einkommen & Ausgaben
| Feld | Typ | Standard | Range | Einheit | Verwendung |
|------|-----|----------|-------|---------|------------|
| `initialGrossSalary` | Number | 40000 | 0-500000 | €/Jahr | Basis für Nettolohnberechnung |
| `salaryGrowthRate` | Number | 3 | 0-10 | %/Jahr | Jährliche Gehaltssteigerung |
| `monthlyExpenses` | Number | 2200 | 0-50000 | €/Monat | Lebenshaltungskosten |
| `savingsRate` | Number | 80 | 0-100 | % | Anteil des verfügbaren Einkommens gespart |
| `initialAssets` | Number | 60000 | 0-10000000 | € | Startvermögen |

#### Rentenziele
| Feld | Typ | Standard | Range | Einheit | Verwendung |
|------|-----|----------|-------|---------|------------|
| `desiredMonthlyRetirement` | Number | 3000 | 0-50000 | €/Monat | Gewünschtes Renteneinkommen |
| `expectedPension` | Number | 1200 | 0-10000 | €/Monat | Erwartete staatliche Rente |

### 🏖️ Ruhestandsmodus - Eingabefelder

| Feld | Typ | Standard | Range | Einheit | Verwendung |
|------|-----|----------|-------|---------|------------|
| `retireeCurrentAge` | Number | 65 | 50-100 | Jahre | Aktuelles Alter im Ruhestand |
| `retireeLifeExpectancy` | Number | 95 | 60-120 | Jahre | Lebenserwartung |
| `retireeCurrentAssets` | Number | 500000 | 0-50000000 | € | Aktuelles Vermögen |
| `retireeAnnualIncome` | Number | 24000 | 0-200000 | €/Jahr | Jährliches Nettoeinkommen |
| `retireeAnnualExpenses` | Number | 36000 | 0-200000 | €/Jahr | Jährliche Ausgaben |
| `retireeIncomeGrowthRate` | Number | 1.5 | 0-5 | %/Jahr | Einkommenssteigerung |

### 🏛️ Marktparameter (Gemeinsam)

| Feld | Typ | Standard | Range | Einheit | Verwendung |
|------|-----|----------|-------|---------|------------|
| `investmentReturnRate` | Number | 6 | 0-15 | %/Jahr | Kapitalmarkt-Rendite vor Steuern |
| `inflationRate` | Number | 2 | 0-8 | %/Jahr | Inflationsrate (ersetzt Kostensteigerung) |

### 🏠 Erbschaft (Optional)

| Feld | Typ | Standard | Range | Einheit | Verwendung |
|------|-----|----------|-------|---------|------------|
| `inheritanceAmount` | Number | 150000 | 0-50000000 | € | Erbschaftssumme |
| `inheritanceYear` | Number | 2045 | 2025-2150 | Jahr | Jahr der Erbschaft |

## 🧮 Berechnungsmodelle & Formeln

### 💰 Deutsche Nettolohnberechnung

#### Sozialversicherungsbeiträge
```javascript
// Beitragsbemessungsgrenzen (2024)
const healthInsuranceCeiling = 62100;      // €/Jahr
const pensionInsuranceCeiling = 90600;     // €/Jahr

// Beitragssätze (Arbeitnehmeranteil)
const healthInsuranceRate = 0.073 + 0.0085;  // 8.15% (GKV + Zusatzbeitrag)
const nursingCareInsuranceRate = 0.023;       // 2.3%
const pensionInsuranceRate = 0.093;           // 9.3%
const unemploymentInsuranceRate = 0.013;      // 1.3%

// Berechnung
healthContribution = min(grossSalary, 62100) * 0.0815;
nursingCareContribution = min(grossSalary, 62100) * 0.023;
pensionContribution = min(grossSalary, 90600) * 0.093;
unemploymentContribution = min(grossSalary, 90600) * 0.013;
```

#### Einkommensteuer (vereinfacht)
```javascript
taxableIncome = grossSalary - socialContributions - 1264; // Werbungskostenpauschale
basicTaxFreeAllowance = 11604; // €/Jahr (2024)

if (taxableIncome <= basicTaxFreeAllowance) {
    incomeTax = 0;
} else if (taxableIncome <= 17005) {
    y = (taxableIncome - 11604) / 10000;
    incomeTax = (979.18 * y + 1400) * y;
} else if (taxableIncome <= 66760) {
    z = (taxableIncome - 17005) / 10000;
    incomeTax = (192.59 * z + 2397) * z + 975.79;
} else if (taxableIncome <= 277825) {
    incomeTax = 0.42 * taxableIncome - 10253.81;
} else {
    incomeTax = 0.45 * taxableIncome - 18588.56;
}
```

#### Solidaritätszuschlag
```javascript
soliThreshold = 18130;
if (incomeTax > soliThreshold) {
    if (incomeTax <= 34332) {
        soli = min(0.055 * incomeTax, 0.119 * (incomeTax - soliThreshold));
    } else {
        soli = 0.055 * incomeTax;
    }
}
```

### 📈 Ansparphase - Berechnung

#### Jährliche Iteration
```javascript
// Jahr i der Berechnung
year = currentYear + i;
age = currentAge + i;
inflationFactor = (1 + inflationRate/100)^i;

// Gehaltsentwicklung
if (i > 0) {
    currentGrossSalary *= (1 + salaryGrowthRate/100);
    currentAnnualExpenses *= (1 + inflationRate/100); // Inflation nur für Kosten
}

// Nettolohn
netSalary = calculateNetSalary(currentGrossSalary);

// Verfügbares Einkommen & Sparen
annualDisposableIncome = netSalary - currentAnnualExpenses;
annualSavings = max(0, annualDisposableIncome * savingsRate/100);

// Kapitalerträge & Steuern
investmentGains = assetsAtYearStart * (investmentReturnRate/100);
if (investmentGains > 1000) { // Freibetrag
    netInvestmentGains = 1000 + (investmentGains - 1000) * 0.75; // 25% KapESt
} else {
    netInvestmentGains = investmentGains;
}

// Vermögensentwicklung
currentAssets += netInvestmentGains + annualSavings;

// Optional: Erbschaft
if (inheritanceEnabled && year === inheritanceYear) {
    currentAssets += inheritanceAmount;
}
```

#### Ruhestandsphase
```javascript
// Bei Renteneintritt
if (year >= retirementStartYear) {
    if (assetsAtRetirement === 0) {
        assetsAtRetirement = currentAssets;
        // Zielbasierte Ausgaben
        evolvingRetirementExpenses = desiredMonthlyRetirement * 12 || lastAnnualNetSalary;
    } else {
        evolvingRetirementExpenses *= (1 + inflationRate/100);
    }
    
    // Rente berücksichtigen
    expectedAnnualPension = expectedPension * 12 * inflationFactor;
    netWithdrawalNeeded = max(0, evolvingRetirementExpenses - expectedAnnualPension);
    
    currentAssets += netInvestmentGains - netWithdrawalNeeded;
}
```

### 🏖️ Ruhestandsmodus - Berechnung

```javascript
// Jährliche Iteration für bereits Rentner
if (i > 0) {
    annualExpenses *= (1 + inflationRate/100);
    annualNetIncome *= (1 + retireeIncomeGrowthRate/100);
}

investmentGains = assetsAtYearStart * (investmentReturnRate/100);
netInvestmentGains = investmentGains > 1000 ? 
    1000 + (investmentGains - 1000) * 0.75 : investmentGains;

totalAnnualIncome = annualNetIncome + netInvestmentGains;
coverageGap = max(0, annualExpenses - totalAnnualIncome);

currentAssets += totalAnnualIncome - annualExpenses;
```

### 🎯 Zielerreichung - 4%-Regel

```javascript
// Nachhaltige Entnahme
sustainableWithdrawal = assetsAtRetirement * 0.04;
sustainableMonthlyIncome = sustainableWithdrawal / 12;

// Gesamteinkommen
totalExpectedIncome = sustainableMonthlyIncome + expectedPension;

// Zielbewertung
goalMet = totalExpectedIncome >= desiredMonthlyRetirement;
gapOrSurplus = totalExpectedIncome - desiredMonthlyRetirement;
```

## 🔗 Abhängigkeiten & Berechnungsflow

### Input Dependencies
```
currentAge → retirementAge → lifeExpectancy
initialGrossSalary → salaryGrowthRate → netSalary
monthlyExpenses → inflationRate → retirementExpenses
savingsRate → disposableIncome → annualSavings
investmentReturnRate → investmentGains → assetGrowth
```

### Calculation Chain
```
1. Mode Selection (isRetirementMode)
   ├── Accumulation Mode
   │   ├── Tax Calculation (German system)
   │   ├── Savings Calculation
   │   ├── Asset Growth (with taxes)
   │   ├── Inflation Adjustment
   │   └── Retirement Phase Transition
   └── Retirement Mode
       ├── Income vs Expenses
       ├── Asset Depletion
       └── Coverage Gap Analysis

2. Optional Features
   ├── Inheritance (if enabled)
   │   └── Asset Boost at specific year
   └── Pension Income
       └── Reduces withdrawal need
```

### Critical Calculation Points
- **Steuerberechnung**: Komplexes deutsches Steuersystem
- **Inflationsanpassung**: Nur für Kosten, nicht für Gehaltswachstum
- **Kapitalertragsteuer**: 25% mit €1.000 Freibetrag
- **Vermögensabbau**: 4%-Regel als Nachhaltigkeitsmaßstab
- **Erbschaft**: Punktuelle Vermögenssteigerung

## 🎛️ UI State Management

### React State Structure
```javascript
const [inputs, setInputs] = useState({
    // Mode toggles
    isRetirementMode: Boolean,
    inheritanceEnabled: Boolean,
    
    // Accumulation inputs (10 fields)
    currentAge: Number,
    retirementAge: Number,
    // ... weitere Felder
    
    // Retirement inputs (6 fields)
    retireeCurrentAge: Number,
    // ... weitere Felder
    
    // Market parameters (2 fields)
    investmentReturnRate: Number,
    inflationRate: Number,
    
    // Optional inheritance (2 fields)
    inheritanceAmount: Number,
    inheritanceYear: Number
});
```

### Event Handlers
```javascript
// Numeric inputs
handleInputChange(e) → setInputs(Number(value))

// Toggle switches  
handleToggleChange(e) → setInputs(Boolean(checked))
```

## 📊 Output Datenmodell

### Projection Data Structure
```javascript
projectionData = [
    {
        year: Number,                    // Kalenderjahr
        age: Number,                     // Alter der Person
        grossSalary: Number,             // Bruttogehalt (nur Ansparphase)
        netSalary: Number,               // Nettogehalt (nur Ansparphase)
        monthlyNetSalary: Number,        // Netto pro Monat
        monthlyExpenses: Number,         // Kosten pro Monat
        monthlyDisposableIncome: Number, // Verfügbar pro Monat
        monthlySavingsAmount: Number,    // Gespart pro Monat
        totalAssets: Number,             // Gesamtvermögen (nominal)
        realTotalAssets: Number,         // Kaufkraftbereinigtes Vermögen
        retirementWithdrawal: Number,    // Entnahme in Rente
        realRetirementWithdrawal: Number,// Kaufkraftbereinigte Entnahme
        investmentGains: Number,         // Bruttokapitalerträge
        netInvestmentGains: Number,      // Nettokapitalerträge (nach KapESt)
        coverageGap: Number,             // Deckungslücke
        assetsAtYearStart: Number,       // Vermögen zu Jahresbeginn
        annualNetIncome: Number          // Jahres-Nettoeinkommen (nur Ruhestand)
    }
]
```

## �🚀 Features

## 🔧 Optimierungspotentiale

### 🧮 Berechnungsmodell-Verbesserungen

#### Steuerberechnung
- **Kirchensteuer**: Derzeit nicht berücksichtigt (8-9% auf ESt)
- **Riester/Rürup**: Staatlich geförderte Altersvorsorge fehlt
- **Betriebliche Altersvorsorge**: Entgeltumwandlung nicht modelliert
- **Progressionsvorbehalt**: Bei Arbeitslosengeld, Elterngeld etc.

#### Inflation & Kosten
- **Differentielle Inflation**: Unterschiedliche Raten für verschiedene Kostenkategorien
- **Energiekosten**: Separate Behandlung volatiler Energiepreise
- **Gesundheitskosten**: Überproportionale Steigerung im Alter

#### Kapitalanlage
- **Asset Allocation**: Verschiedene Anlageklassen (Aktien, Anleihen, Immobilien)
- **Rebalancing**: Periodische Umschichtung
- **Sequence of Returns Risk**: Reihenfolge der Renditen in der Entnahmephase
- **Volatilität**: Monte-Carlo-Simulation für Renditeschwankungen

#### Rente & Soziales
- **Rentenpunkte**: Präzise Berechnung der gesetzlichen Rente
- **Rentenanpassung**: Rentenwert-Entwicklung
- **Krankenversicherung**: Beiträge auf Kapitalerträge im Alter
- **Pflegeversicherung**: Zusätzliche Kosten im Alter

### 📊 Input-Validierung & UX

#### Plausibilitätsprüfungen
```javascript
// Beispiel-Validierungen
if (retirementAge <= currentAge) → Error
if (lifeExpectancy <= retirementAge) → Warning
if (savingsRate > 100) → Error
if (monthlyExpenses > netSalary) → Warning
if (desiredMonthlyRetirement < monthlyExpenses * 0.7) → Warning
```

#### Smart Defaults
- **Regionale Anpassung**: Durchschnittswerte nach PLZ/Region
- **Altersbasierte Defaults**: Typische Werte je Altersgruppe
- **Einkommensbasierte Vorschläge**: Sparrate abhängig vom Einkommen

### 🎯 Erweiterte Features

#### Szenarien-Analyse
- **Best/Worst/Expected Case**: Verschiedene Rendite-/Inflationsszenarien
- **Sensitivitätsanalyse**: Auswirkung von Parameter-Änderungen
- **Monte-Carlo-Simulation**: Wahrscheinlichkeitsverteilungen

#### Detaillierte Ausgaben
```javascript
// Erweiterte Kostenstruktur
monthlyExpenses: {
    housing: Number,        // Wohnen (inkl. Nebenkosten)
    food: Number,          // Lebensmittel
    transportation: Number, // Mobilität
    insurance: Number,     // Versicherungen
    healthcare: Number,    // Gesundheit
    leisure: Number,       // Freizeit
    other: Number         // Sonstiges
}
```

#### Steueroptimierung
- **Günstigerprüfung**: Einmalbesteuerung vs. nachgelagerte Besteuerung
- **Freibeträge**: Optimale Nutzung aller Freibeträge
- **Verlustverrechnung**: Steuerliche Verluste bei der Kapitalanlage

### 🏗️ Technische Optimierungen

#### Performance
- **Memoization**: React.memo für Chart-Komponenten
- **Web Workers**: Berechnungen in separatem Thread
- **Progressive Enhancement**: Grundfunktionen ohne JavaScript

#### Code-Struktur
```javascript
// Modulare Berechnungsengine
/src/utils/
├── calculations/
│   ├── tax.js           // Steuerberechnung
│   ├── pension.js       // Rentenberechnung  
│   ├── assets.js        // Vermögensrechnung
│   ├── inflation.js     // Inflationsanpassung
│   └── scenarios.js     // Szenarioanalyse
├── validation/
│   ├── inputs.js        // Input-Validierung
│   └── plausibility.js  // Plausibilitätsprüfungen
└── constants/
    ├── tax-rates.js     // Steuersätze & Freibeträge
    └── defaults.js      // Standard-Werte
```

#### Datenqualität
- **Input Sanitization**: Bereinigung von Eingabedaten
- **Error Boundaries**: Graceful Fehlerbehandlung
- **Unit Tests**: Automatisierte Tests für Berechnungen

### 📈 Zusätzliche Visualisierungen

#### Chart-Erweiterungen
- **Stacked Area Chart**: Aufteilung nach Einkommensquellen
- **Waterfall Chart**: Jahr-zu-Jahr Vermögensveränderungen
- **Risk Cone**: Wahrscheinlichkeitskorridor für Vermögensentwicklung
- **Drawdown Chart**: Maximale Verluste in verschiedenen Zeiträumen

#### Interaktive Elemente
- **Parameter Slider**: Live-Update bei Änderungen
- **Tooltip Details**: Detaillierte Informationen zu jedem Datenpunkt
- **Zoom & Pan**: Navigation in langen Zeitreihen
- **Export Functions**: PDF/Excel-Export der Ergebnisse

### 🔄 Datenmodell-Erweiterungen

#### Erweiterte Input-Struktur
```javascript
// Komplexeres Datenmodell
inputs: {
    personal: {
        currentAge: Number,
        retirementAge: Number,
        lifeExpectancy: Number,
        location: String,      // PLZ für regionale Anpassungen
        maritalStatus: String, // Steuerklasse-Relevanz
        children: Number       // Kindergeld, Freibeträge
    },
    income: {
        grossSalary: Number,
        salaryGrowthRate: Number,
        bonusPayments: Number,   // Variable Vergütung
        sideIncome: Number,      // Nebeneinkommen
        partnerIncome: Number    // Partner-Einkommen
    },
    expenses: {
        housing: Number,
        livingCosts: Number,
        luxurySpending: Number,
        healthcare: Number,
        education: Number        // Weiterbildung, Kinder
    },
    investments: {
        stockAllocation: Number,    // Aktienquote
        bondAllocation: Number,     // Anleihenquote
        realEstateAllocation: Number, // Immobilienquote
        rebalancingFrequency: String, // Quartalsweise, jährlich
        fees: Number               // Verwaltungskosten
    }
}
```

## 💻 Development Setup & Testing
### 🧪 Testing Framework

```bash
# Unit Tests für Berechnungslogik
npm test -- --coverage

# Beispiel-Tests
describe('Tax Calculation', () => {
    test('calculates correct net salary for 50k gross', () => {
        expect(calculateNetSalary(50000).netSalary).toBeCloseTo(34567, 0);
    });
    
    test('applies capital gains tax correctly', () => {
        expect(calculateCapitalGainsTax(5000)).toBe(4000); // 1000 + 3000*0.75
    });
});

describe('Asset Projection', () => {
    test('handles inheritance correctly when enabled', () => {
        const inputs = { inheritanceEnabled: true, inheritanceYear: 2030, inheritanceAmount: 100000 };
        const result = calculateProjection(inputs);
        expect(result.find(d => d.year === 2030).totalAssets).toBeGreaterThan(100000);
    });
});
```

### 🔍 Debugging & Monitoring

```javascript
// Development Helpers
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
    console.log('Calculation Debug:', {
        year,
        grossSalary,
        netSalary,
        taxes: grossSalary - netSalary,
        savings: annualSavings,
        assets: currentAssets
    });
}
```

## 🛠️ Tech Stack

- **React** 18.2+ - Frontend Framework
- **Tailwind CSS** 3.3+ - Utility-first CSS
- **Chart.js** 4.4+ - Charting Library
- **chartjs-plugin-annotation** 3.0+ - Chart Annotations
- **PostCSS** - CSS Processing
- **ESLint** - Code Linting

## 🚀 Quick Start

```bash
# Dependencies installieren
npm install

# Development Server starten  
npm start

# Tests ausführen
npm test

# Production Build
npm run build

# Bundle Analyzer
npm run analyze
```

## � Calculation Examples

### Beispiel 1: Standard-Szenario
```javascript
inputs = {
    currentAge: 30,
    retirementAge: 67,
    lifeExpectancy: 85,
    initialGrossSalary: 60000,
    salaryGrowthRate: 2.5,
    monthlyExpenses: 3000,
    savingsRate: 20,
    initialAssets: 50000,
    investmentReturnRate: 7,
    inflationRate: 2,
    inheritanceEnabled: false
}

// Erwartetes Ergebnis nach 37 Jahren:
// - Vermögen bei Rente: ~€1.2M
// - Nachhaltige Entnahme: ~€4.000/Monat
// - Deckung bis Lebensende: Ja
```

### Beispiel 2: Mit Erbschaft
```javascript
inputs = {
    // ... gleiche Basis-Parameter
    inheritanceEnabled: true,
    inheritanceAmount: 200000,
    inheritanceYear: 2045
}

// Auswirkung der Erbschaft:
// - Zusätzliches Vermögen: €200k in 2045
// - Zinserträge darauf: €14k/Jahr zusätzlich
// - Frühere Rente möglich oder höhere Entnahme
```

## ⚠️ Limitationen & Annahmen

### Vereinfachungen
- **Konstante Renditen**: Keine Marktvolatilität berücksichtigt
- **Lineare Entwicklungen**: Gehalt und Kosten steigen gleichmäßig
- **Steuerrecht**: Aktueller Stand, keine zukünftigen Änderungen
- **Gesundheit**: Keine außergewöhnlichen Gesundheitskosten
- **Familiensituation**: Keine Änderungen (Heirat, Scheidung, Kinder)

### Risiken nicht modelliert
- **Arbeitslosigkeit**: Einkommensausfall nicht berücksichtigt
- **Krankheit**: Langzeit-Arbeitsunfähigkeit
- **Inflation Spikes**: Extreme Inflationsphasen
- **Market Crashes**: Finanzkrisen und Markteinbrüche
- **Politische Risiken**: Änderungen im Steuer-/Rentensystem

## 📊 Performance Benchmarks

```javascript
// Typische Berechnungszeiten (lokale Entwicklung)
- 50 Jahre Projektion: ~5-10ms
- Chart Rendering: ~50-100ms  
- Full App Initial Load: ~200-500ms

// Speicherverbrauch
- Input State: ~2KB
- Projection Data (50 Jahre): ~50KB
- Chart Data: ~100KB
```

---

**Entwickelt für Modelloptimierung und technische Analyse**
