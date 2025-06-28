// Deutsche Finanzplanungs-Berechnungen für Elke
// Präzise Steuer- und Sozialversicherungsberechnungen

/**
 * Deutsche Einkommensteuer-Tariffunktion 2024/2025
 * @param {number} zvE - Zu versteuerndes Einkommen (jährlich)
 * @returns {number} Einkommensteuer (jährlich)
 */
export function calculateIncomeTax(zvE) {
  if (zvE <= 11604) return 0; // Grundfreibetrag 2024
  
  if (zvE <= 17005) {
    // Zone 1: Progressionsbereich I
    const y = (zvE - 11604) / 10000;
    return Math.round((922.98 * y + 1400) * y);
  }
  
  if (zvE <= 66760) {
    // Zone 2: Progressionsbereich II
    const z = (zvE - 17005) / 10000;
    return Math.round((181.19 * z + 2397) * z + 1025.38);
  }
  
  if (zvE <= 277825) {
    // Zone 3: Proportionalbereich I
    return Math.round(0.42 * zvE - 10602.13);
  }
  
  // Zone 4: Proportionalbereich II (Reichensteuer)
  return Math.round(0.45 * zvE - 18936.88);
}

/**
 * Solidaritätszuschlag berechnen
 * @param {number} incomeTax - Einkommensteuer
 * @returns {number} Solidaritätszuschlag
 */
export function calculateSolidarityTax(incomeTax) {
  const exemptionLimit = 16956; // Freigrenze 2024
  if (incomeTax <= exemptionLimit) return 0;
  
  const rate = 0.055;
  const reduction = exemptionLimit * rate * 0.2;
  return Math.max(0, incomeTax * rate - reduction);
}

/**
 * Gesetzliche Krankenversicherung berechnen
 * @param {number} income - Bruttoeinkommen (monatlich)
 * @param {number} additionalRate - Zusatzbeitragssatz (default: 1.3%)
 * @returns {number} GKV-Beitrag (monatlich)
 */
export function calculateHealthInsurance(income, additionalRate = 1.3) {
  const minIncome = 1131.67; // Mindesteinkommen 2024 (monatlich)
  const maxIncome = 5175; // Beitragsbemessungsgrenze 2024 (monatlich)
  
  const assessmentBase = Math.max(minIncome, Math.min(income, maxIncome));
  const baseRate = 14.6; // Allgemeiner Beitragssatz
  const totalRate = baseRate + additionalRate;
  
  return Math.round(assessmentBase * (totalRate / 100) * 100) / 100;
}

/**
 * AfA (Abschreibung für Abnutzung) berechnen
 * @param {object} property - Immobilien-Objekt
 * @returns {number} AfA-Betrag (jährlich)
 */
export function calculateDepreciation(property) {
  if (!property.afaActive || property.afaRemainingYears <= 0) return 0;
  
  const purchasePrice = property.purchasePrice || 0;
  const landValue = property.landValue || 0;
  const buildingValue = purchasePrice - landValue;
  
  return Math.round(buildingValue * (property.afaRate / 100));
}

/**
 * Immobilien-Cashflow berechnen (monatlich)
 * @param {object} property - Immobilien-Objekt
 * @param {number} month - Monat im Jahr (0-11)
 * @returns {object} Cashflow-Details
 */
export function calculatePropertyCashflow(property, month = 0) {
  const monthlyRent = property.monthlyRent || 0;
  const vacancyRate = property.vacancyRate || 0;
  const annualMaintenance = property.annualMaintenance || 0;
  
  // Effektive Miete nach Leerstand
  const effectiveRent = monthlyRent * (1 - vacancyRate / 100);
  
  // Monatliche Instandhaltung
  const monthlyMaintenance = annualMaintenance / 12;
  
  // AfA (nur für Steuern relevant, nicht für Cashflow)
  const annualAfa = calculateDepreciation(property);
  const monthlyAfa = annualAfa / 12;
  
  return {
    grossRent: monthlyRent,
    effectiveRent: effectiveRent,
    maintenance: monthlyMaintenance,
    afa: monthlyAfa,
    netCashflow: effectiveRent - monthlyMaintenance
  };
}

/**
 * Monatlichen Gesamtcashflow berechnen
 * @param {object} inputs - Alle Eingabedaten
 * @param {number} month - Monat seit Start (0-basiert)
 * @returns {object} Detaillierte Cashflow-Berechnung
 */
export function calculateMonthlyCashflow(inputs, month = 0) {
  const year = Math.floor(month / 12);
  const currentMonth = month % 12;
  
  // Inflationsanpassung
  const inflation = Math.pow(1 + (inputs.assumptions.inflationRate / 100), year);
  const incomeGrowth = Math.pow(1 + (inputs.assumptions.incomeGrowthRate / 100), year);
  const expenseGrowth = Math.pow(1 + (inputs.assumptions.expenseGrowthRate / 100), year);
  
  // === EINNAHMEN ===
  const monthlyPension = (inputs.income.pension || 0) * incomeGrowth;
  const monthlyOtherIncome = (inputs.income.otherIncome || 0) * incomeGrowth;
  
  // Immobilieneinnahmen
  let totalPropertyIncome = 0;
  let totalPropertyMaintenance = 0;
  let totalPropertyAfa = 0;
  
  inputs.properties.forEach(property => {
    const cashflow = calculatePropertyCashflow(property, currentMonth);
    totalPropertyIncome += cashflow.effectiveRent * incomeGrowth;
    totalPropertyMaintenance += cashflow.maintenance * expenseGrowth;
    totalPropertyAfa += cashflow.afa; // AfA nicht inflationsadjustiert
  });
  
  // Einmalige Einnahmen
  let oneTimeIncome = 0;
  inputs.income.oneTime?.forEach(item => {
    if (item.month === month) {
      oneTimeIncome += item.amount;
    }
  });
  
  const grossIncome = monthlyPension + monthlyOtherIncome + totalPropertyIncome + oneTimeIncome;
  
  // === AUSGABEN ===
  // Fixkosten
  const housing = (inputs.expenses.housing || 0) * expenseGrowth;
  const otherInsurance = (inputs.expenses.otherInsurance || 0) * expenseGrowth;
  
  // GKV berechnen
  const monthlyGrossIncome = monthlyPension + monthlyOtherIncome + totalPropertyIncome;
  const healthInsurance = calculateHealthInsurance(monthlyGrossIncome);
  
  // Variable Kosten
  const groceries = (inputs.expenses.groceries || 0) * expenseGrowth;
  const leisure = (inputs.expenses.leisure || 0) * expenseGrowth;
  
  // Einmalige Ausgaben
  let oneTimeExpenses = 0;
  inputs.expenses.oneTime?.forEach(item => {
    if (item.month === month) {
      oneTimeExpenses += item.amount;
    }
  });
  
  const totalExpensesBeforeTax = housing + otherInsurance + healthInsurance + groceries + leisure + totalPropertyMaintenance + oneTimeExpenses;
  
  // === STEUERN ===
  // Zu versteuerndes Einkommen (jährlich)
  const annualGrossIncome = monthlyGrossIncome * 12;
  const annualPropertyExpenses = totalPropertyMaintenance * 12;
  const annualAfA = totalPropertyAfa * 12;
  const annualOtherDeductions = (inputs.assumptions.annualDeductions || 0);
  
  const taxableIncome = Math.max(0, annualGrossIncome - annualPropertyExpenses - annualAfA - annualOtherDeductions);
  
  const annualIncomeTax = calculateIncomeTax(taxableIncome);
  const annualSoliTax = calculateSolidarityTax(annualIncomeTax);
  const monthlyTax = (annualIncomeTax + annualSoliTax) / 12;
  
  // === ERGEBNIS ===
  const netCashflow = grossIncome - totalExpensesBeforeTax - monthlyTax;
  
  return {
    month,
    year: year + 1, // 1-basiert für Anzeige
    income: {
      pension: monthlyPension,
      otherIncome: monthlyOtherIncome,
      propertyIncome: totalPropertyIncome,
      oneTime: oneTimeIncome,
      total: grossIncome
    },
    expenses: {
      housing,
      healthInsurance,
      otherInsurance,
      groceries,
      leisure,
      propertyMaintenance: totalPropertyMaintenance,
      oneTime: oneTimeExpenses,
      tax: monthlyTax,
      total: totalExpensesBeforeTax + monthlyTax
    },
    tax: {
      taxableIncome,
      annualIncomeTax,
      annualSoliTax,
      monthlyTotal: monthlyTax
    },
    netCashflow,
    inflation,
    details: {
      totalPropertyAfa: totalPropertyAfa,
      effectiveGrossIncome: monthlyGrossIncome
    }
  };
}

/**
 * Komplette Finanzplanung für Zeitraum berechnen
 * @param {object} inputs - Alle Eingabedaten
 * @param {number} months - Anzahl Monate
 * @returns {object} Vollständige Projektion
 */
export function calculateFinancialProjection(inputs, months = 120) {
  const results = [];
  let currentCash = inputs.initialCash || 0;
  
  for (let month = 0; month < months; month++) {
    const monthlyResult = calculateMonthlyCashflow(inputs, month);
    
    // Zinsen auf Cash-Bestand
    const monthlyInterest = currentCash * (inputs.assumptions.savingsReturn / 100 / 12);
    currentCash += monthlyResult.netCashflow + monthlyInterest;
    
    // Immobilienwerte aktualisieren
    const year = Math.floor(month / 12);
    const propertyValueGrowth = Math.pow(1 + (inputs.assumptions.propertyValueGrowth / 100), year);
    let totalPropertyValue = 0;      inputs.properties.forEach(property => {
        // Prüfen ob Verkauf geplant
        if (property.plannedSale && property.plannedSale.year === year + 1) {
          totalPropertyValue += property.plannedSale.price;
          // Verkaufserlös zu Cash hinzufügen (vereinfacht, ohne Steuern)
          if (month % 12 === 0) { // Einmal pro Jahr
            const saleProceeds = property.plannedSale.price;
            currentCash += saleProceeds;
          }
        } else {
          totalPropertyValue += (property.currentValue || 0) * propertyValueGrowth;
        }
      });
    
    const netWorth = currentCash + totalPropertyValue;
    
    results.push({
      ...monthlyResult,
      cashBalance: currentCash,
      propertyValue: totalPropertyValue,
      netWorth,
      monthlyInterest
    });
  }
  
  return {
    monthlyResults: results,
    summary: calculateProjectionSummary(results, inputs),
    kpis: calculateKPIs(results, inputs)
  };
}

/**
 * Zusammenfassung der Projektion berechnen
 */
function calculateProjectionSummary(results, inputs) {
  const totalMonths = results.length;
  const totalIncome = results.reduce((sum, r) => sum + r.income.total, 0);
  const totalExpenses = results.reduce((sum, r) => sum + r.expenses.total, 0);
  const finalCash = results[results.length - 1]?.cashBalance || 0;
  const finalNetWorth = results[results.length - 1]?.netWorth || 0;
  
  return {
    totalMonths,
    totalIncome,
    totalExpenses,
    totalNetCashflow: totalIncome - totalExpenses,
    finalCash,
    finalNetWorth,
    averageMonthlyCashflow: (totalIncome - totalExpenses) / totalMonths
  };
}

/**
 * KPIs berechnen
 */
function calculateKPIs(results, inputs) {
  const averageMonthlyCashflow = results.reduce((sum, r) => sum + r.netCashflow, 0) / results.length;
  
  // Liquiditätspuffer: Monate mit aktuellem Cash überbrückbar
  const averageMonthlyExpenses = results.reduce((sum, r) => sum + r.expenses.total, 0) / results.length;
  const currentCash = results[results.length - 1]?.cashBalance || 0;
  const liquidityBuffer = averageMonthlyExpenses > 0 ? currentCash / averageMonthlyExpenses : 0;
  
  // Deckung bis Jahr X: Erstes Jahr mit negativem Cash-Bestand
  let coverageUntilYear = null;
  for (let i = 0; i < results.length; i++) {
    if (results[i].cashBalance < 0) {
      coverageUntilYear = results[i].year;
      break;
    }
  }
  
  return {
    averageMonthlyCashflow,
    liquidityBuffer,
    coverageUntilYear: coverageUntilYear || `${Math.ceil(results.length / 12)}+`,
    finalNetWorth: results[results.length - 1]?.netWorth || 0
  };
}

/**
 * Stress-Test Szenarien
 */
export function runStressTests(inputs, baseResults) {
  const scenarios = {
    highVacancy: {
      ...inputs,
      properties: inputs.properties.map(p => ({
        ...p,
        vacancyRate: Math.min((p.vacancyRate || 0) + 20, 100)
      }))
    },
    highInflation: {
      ...inputs,
      assumptions: {
        ...inputs.assumptions,
        inflationRate: (inputs.assumptions.inflationRate || 2) + 3
      }
    },
    lowReturns: {
      ...inputs,
      assumptions: {
        ...inputs.assumptions,
        savingsReturn: Math.max(0, (inputs.assumptions.savingsReturn || 2) - 2)
      }
    }
  };
  
  const results = {};
  Object.keys(scenarios).forEach(scenario => {
    results[scenario] = calculateFinancialProjection(scenarios[scenario]);
  });
  
  return results;
}

/**
 * Hilfsfunktionen für Formatierung
 */
export const formatters = {
  currency: (amount) => new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount),
  
  percentage: (rate) => new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(rate / 100),
  
  number: (num) => new Intl.NumberFormat('de-DE').format(Math.round(num))
};

/**
 * Export der Hauptfunktionen
 */
const calculationsModule = {
  calculateIncomeTax,
  calculateSolidarityTax,
  calculateHealthInsurance,
  calculateDepreciation,
  calculatePropertyCashflow,
  calculateMonthlyCashflow,
  calculateFinancialProjection,
  runStressTests,
  formatters
};

export default calculationsModule;
