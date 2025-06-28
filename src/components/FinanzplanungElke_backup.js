import React, { useState, useMemo } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { calculateFinancialProjection, runStressTests, formatters } from '../utils/calculations';
import EinkommenSection from './EinkommenSection';
import AusgabenSection from './AusgabenSection';
import ImmobilienManager from './ImmobilienManager';
import AnnahmenParameterTest from './AnnahmenParameterTest';
// import ExpenseSankeyChart from './ExpenseSankeyChart';
import './FinanzplanungElke.css';

// Chart.js registrieren
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FinanzplanungElke = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState(120); // 10 Jahre default
  const [showTransparency, setShowTransparency] = useState(false);
  const [currentAge, setCurrentAge] = useState(65); // Aktuelles Alter
  const [showYearlyTable, setShowYearlyTable] = useState(false); // Jahreszusammenfassung
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    income: false,
    expenses: false,
    properties: false,
    assumptions: false
  });
  
  // Hauptdatenstruktur
  const [financialData, setFinancialData] = useState({
    initialCash: 50000,
    income: {
      pension: 1800,
      otherIncome: 500,
      oneTime: [] // {month: number, amount: number, description: string}
    },
    expenses: {
      housing: 800,
      otherInsurance: 200,
      groceries: 400,
      leisure: 300,
      oneTime: [] // {month: number, amount: number, name: string}
    },
    properties: [
      {
        id: 1,
        name: 'Wohnung Musterstraße',
        monthlyRent: 1200,
        vacancyRate: 5,
        annualMaintenance: 2400,
        currentValue: 250000,
        afaActive: true,
        afaRate: 2,
        afaRemainingYears: 15,
        purchasePrice: 200000,
        landValue: 50000
      }
    ],
    assumptions: {
      inflationRate: 2.5,
      savingsReturn: 3.0,
      incomeGrowthRate: 1.5,
      expenseGrowthRate: 2.0,
      propertyValueGrowth: 2.0,
      annualDeductions: 1000
    }
  });

  // Berechnungen
  const projection = useMemo(() => {
    try {
      return calculateFinancialProjection(financialData, timeRange);
    } catch (error) {
      console.error('Fehler bei Berechnung:', error);
      return {
        monthlyResults: [],
        summary: {},
        kpis: {
          averageMonthlyCashflow: 0,
          liquidityBuffer: 0,
          coverageUntilYear: 'N/A',
          finalNetWorth: 0
        }
      };
    }
  }, [financialData, timeRange]);

  const stressTests = useMemo(() => {
    try {
      return runStressTests(financialData, projection);
    } catch (error) {
      console.error('Fehler bei Stress-Tests:', error);
      return {};
    }
  }, [financialData, projection]);

  // Chart-Daten für Vermögensentwicklung
  const chartData = useMemo(() => {
    if (!projection.monthlyResults || projection.monthlyResults.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const currentYear = new Date().getFullYear();
    const labels = projection.monthlyResults.map((_, index) => {
      const year = Math.floor(index / 12);
      return `${currentYear + year}`;
    }).filter((_, index) => index % 12 === 0); // Alle 12 Monate (jährlich)

    const cashData = projection.monthlyResults
      .filter((_, index) => index % 12 === 0)
      .map(result => result.cashBalance || 0);

    const netWorthData = projection.monthlyResults
      .filter((_, index) => index % 12 === 0)
      .map(result => result.netWorth || 0);

    // Inflationsbereinigte Werte (heutige Kaufkraft)
    const inflationRate = financialData.assumptions.inflationRate / 100;
    const inflationAdjustedNetWorthData = projection.monthlyResults
      .filter((_, index) => index % 12 === 0)
      .map((result, index) => {
        const years = index;
        const inflationFactor = Math.pow(1 + inflationRate, years);
        return (result.netWorth || 0) / inflationFactor;
      });

    return {
      labels,
      datasets: [
        {
          label: 'Cash-Bestand',
          data: cashData,
          borderColor: '#007AFF',
          backgroundColor: 'rgba(0, 122, 255, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3
        },
        {
          label: 'Nettovermögen (nominal)',
          data: netWorthData,
          borderColor: '#34C759',
          backgroundColor: 'rgba(52, 199, 89, 0.1)',
          fill: false,
          tension: 0.4,
          borderWidth: 3
        },
        {
          label: 'Nettovermögen (kaufkraftbereinigt)',
          data: inflationAdjustedNetWorthData,
          borderColor: '#FF9500',
          backgroundColor: 'rgba(255, 149, 0, 0.1)',
          fill: false,
          tension: 0.4,
          borderWidth: 3,
          borderDash: [5, 5]
        }
      ]
    };
  }, [projection, financialData.assumptions.inflationRate]);

  // Chart-Daten für Ausgabenkategorien (Kreisdiagramme)
  const expenseChartData = useMemo(() => {
    if (!projection.monthlyResults || projection.monthlyResults.length === 0) {
      return { monthly: null, yearly: null };
    }

    const lastMonthResult = projection.monthlyResults[projection.monthlyResults.length - 1];
    if (!lastMonthResult || !lastMonthResult.expenses) return { monthly: null, yearly: null };

    const monthlyExpenses = [
      { label: 'Wohnen', value: lastMonthResult.expenses.housing || 0 },
      { label: 'GKV', value: lastMonthResult.expenses.healthInsurance || 0 },
      { label: 'Versicherungen', value: lastMonthResult.expenses.otherInsurance || 0 },
      { label: 'Lebensmittel', value: lastMonthResult.expenses.groceries || 0 },
      { label: 'Freizeit', value: lastMonthResult.expenses.leisure || 0 },
      { label: 'Immobilien', value: lastMonthResult.expenses.propertyMaintenance || 0 },
      { label: 'Steuern', value: lastMonthResult.expenses.tax || 0 }
    ];

    const yearlyExpenses = monthlyExpenses.map(item => ({
      ...item,
      value: item.value * 12
    }));

    const colors = [
      '#FF3B30', '#FF9500', '#FFCC00', '#34C759', 
      '#5AC8FA', '#AF52DE', '#FF2D92'
    ];

    const monthlyTotal = monthlyExpenses.reduce((sum, item) => sum + item.value, 0);
    const yearlyTotal = yearlyExpenses.reduce((sum, item) => sum + item.value, 0);

    return {
      monthly: {
        labels: monthlyExpenses.map(item => item.label),
        datasets: [{
          data: monthlyExpenses.map(item => item.value),
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }],
        total: monthlyTotal
      },
      yearly: {
        labels: yearlyExpenses.map(item => item.label),
        datasets: [{
          data: yearlyExpenses.map(item => item.value),
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }],
        total: yearlyTotal
      }
    };
  }, [projection]);

  // Jahreszusammenfassungs-Daten
  const yearlyData = useMemo(() => {
    if (!projection.monthlyResults || projection.monthlyResults.length === 0) {
      return [];
    }

    const currentYear = new Date().getFullYear();
    const yearlyResults = [];
    
    for (let yearIndex = 0; yearIndex < Math.ceil(projection.monthlyResults.length / 12); yearIndex++) {
      const yearStartIndex = yearIndex * 12;
      const yearEndIndex = Math.min(yearStartIndex + 11, projection.monthlyResults.length - 1);
      
      if (yearEndIndex >= 0 && projection.monthlyResults[yearEndIndex]) {
        const yearResult = projection.monthlyResults[yearEndIndex];
        const startYearResult = projection.monthlyResults[yearStartIndex] || yearResult;
        
        yearlyResults.push({
          year: currentYear + yearIndex,
          age: currentAge + yearIndex,
          startBalance: startYearResult.cashBalance || 0,
          endBalance: yearResult.cashBalance || 0,
          totalIncome: (yearResult.income?.pension || 0) * 12 + 
                      (yearResult.income?.otherIncome || 0) * 12 + 
                      (yearResult.income?.propertyRent || 0) * 12,
          totalExpenses: (yearResult.expenses?.housing || 0) * 12 +
                        (yearResult.expenses?.healthInsurance || 0) * 12 +
                        (yearResult.expenses?.otherInsurance || 0) * 12 +
                        (yearResult.expenses?.groceries || 0) * 12 +
                        (yearResult.expenses?.leisure || 0) * 12 +
                        (yearResult.expenses?.propertyMaintenance || 0) * 12 +
                        (yearResult.expenses?.tax || 0) * 12,
          netWorth: yearResult.netWorth || 0,
          propertyValue: yearResult.propertyValue || 0
        });
      }
    }
    
    return yearlyResults;
  }, [projection, currentAge]);

  // Einnahmen/Ausgaben Zusammenfassung mit Immobilien-Details
  const incomeExpenseSummary = useMemo(() => {
    if (!projection.monthlyResults || projection.monthlyResults.length === 0) {
      return { income: [], expenses: [], propertyDetails: [] };
    }

    const lastResult = projection.monthlyResults[projection.monthlyResults.length - 1];
    
    // Einnahmen
    const income = [
      { 
        category: 'Rente', 
        monthly: lastResult.income?.pension || 0, 
        yearly: (lastResult.income?.pension || 0) * 12 
      },
      { 
        category: 'Sonstige Einnahmen', 
        monthly: lastResult.income?.otherIncome || 0, 
        yearly: (lastResult.income?.otherIncome || 0) * 12 
      },
      { 
        category: 'Immobilien-Mieteinnahmen', 
        monthly: lastResult.income?.propertyRent || 0, 
        yearly: (lastResult.income?.propertyRent || 0) * 12 
      }
    ];

    // Ausgaben
    const expenses = [
      { 
        category: 'Wohnen', 
        monthly: lastResult.expenses?.housing || 0, 
        yearly: (lastResult.expenses?.housing || 0) * 12 
      },
      { 
        category: 'Krankenversicherung', 
        monthly: lastResult.expenses?.healthInsurance || 0, 
        yearly: (lastResult.expenses?.healthInsurance || 0) * 12 
      },
      { 
        category: 'Versicherungen', 
        monthly: lastResult.expenses?.otherInsurance || 0, 
        yearly: (lastResult.expenses?.otherInsurance || 0) * 12 
      },
      { 
        category: 'Lebensmittel', 
        monthly: lastResult.expenses?.groceries || 0, 
        yearly: (lastResult.expenses?.groceries || 0) * 12 
      },
      { 
        category: 'Freizeit', 
        monthly: lastResult.expenses?.leisure || 0, 
        yearly: (lastResult.expenses?.leisure || 0) * 12 
      },
      { 
        category: 'Immobilien-Instandhaltung', 
        monthly: lastResult.expenses?.propertyMaintenance || 0, 
        yearly: (lastResult.expenses?.propertyMaintenance || 0) * 12 
      },
      { 
        category: 'Steuern', 
        monthly: lastResult.expenses?.tax || 0, 
        yearly: (lastResult.expenses?.tax || 0) * 12 
      }
    ];

    // Immobilien-Details
    const propertyDetails = financialData.properties.map(property => {
      const yearlyRent = property.monthlyRent * 12 * (1 - property.vacancyRate / 100);
      const yearlyMaintenance = property.annualMaintenance;
      const netIncome = yearlyRent - yearlyMaintenance;
      
      return {
        name: property.name,
        yearlyRent,
        yearlyMaintenance,
        netIncome,
        currentValue: property.currentValue,
        yield: (netIncome / property.currentValue) * 100
      };
    });

    return { income, expenses, propertyDetails };
  }, [projection, financialData.properties]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
        },
        bodyFont: {
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatters.currency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return formatters.currency(value);
          },
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
            size: 12
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label}: ${formatters.currency(value)} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].backgroundColor[i],
                  lineWidth: 0,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatters.currency(context.parsed)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '50%'
  };

  return (
    <div className="finanzplanung-elke">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Finanzplanung Elke</h1>
          <div className="header-controls">
            <div className="age-input-group">
              <label htmlFor="currentAge">Aktuelles Alter:</label>
              <input
                id="currentAge"
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                min="18"
                max="100"
                className="age-input"
              />
              <span>Jahre</span>
            </div>
            <div className="horizon-selector-group">
              <label htmlFor="timeRange">Planungshorizont:</label>
              <input
                id="timeRange"
                type="number"
                value={Math.floor(timeRange / 12)}
                onChange={(e) => setTimeRange(Number(e.target.value) * 12)}
                min="1"
                max="30"
                className="horizon-input"
              />
              <span>Jahre</span>
            </div>
            <div className="final-age-display">
              <span>Alter am Ende:</span>
              <strong>{currentAge + Math.floor(timeRange / 12)} Jahre</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Ausklappbare Bereiche statt Navigation */}
      <div className="expandable-sections">
        <div className="expandable-section">
          <button 
            className={`section-toggle ${expandedSections.overview ? 'active' : ''}`}
            onClick={() => setExpandedSections(prev => ({...prev, overview: !prev.overview}))}
          >
            <span>📊 Übersicht</span>
            <span className={`toggle-icon ${expandedSections.overview ? 'expanded' : ''}`}>▼</span>
          </button>
          
          {expandedSections.overview && (
            <div className="section-content">
              {/* KPI-Kacheln */}
              <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon">💶</div>
                <div className="kpi-content">
                  <h3>Verfügbares monatliches Budget</h3>
                  <div className="kpi-value">{formatters.currency(projection.kpis.averageMonthlyCashflow)}</div>
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-icon">🛡️</div>
                <div className="kpi-content">
                  <h3>Liquiditätspuffer</h3>
                  <div className="kpi-value">{Math.round(projection.kpis.liquidityBuffer)} Monate</div>
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-icon">📅</div>
                <div className="kpi-content">
                  <h3>Deckung bis Jahr</h3>
                  <div className="kpi-value">
                    {projection.kpis.coverageUntilYear !== 'N/A' && projection.kpis.coverageUntilYear !== '10+' 
                      ? new Date().getFullYear() + parseInt(projection.kpis.coverageUntilYear) - 1
                      : new Date().getFullYear() + Math.floor(timeRange / 12)
                    }
                  </div>
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-icon">💎</div>
                <div className="kpi-content">
                  <h3>Nettovermögen {currentAge + Math.floor(timeRange / 12)} Jahre</h3>
                  <div className="kpi-value">{formatters.currency(projection.kpis.finalNetWorth)}</div>
                </div>
              </div>
            </div>

            {/* Jahreszusammenfassung */}
            <div className="yearly-summary-section">
              <button 
                className="yearly-summary-toggle"
                onClick={() => setShowYearlyTable(!showYearlyTable)}
              >
                <span>📅 Jahreszusammenfassung</span>
                <span className={`toggle-icon ${showYearlyTable ? 'expanded' : ''}`}>▼</span>
              </button>
              
              {showYearlyTable && (
                <div className="yearly-table-container">
                  <div className="table-wrapper">
                    <table className="yearly-table">
                      <thead>
                        <tr>
                          <th>Jahr</th>
                          <th>Alter</th>
                          <th>Cash Anfang</th>
                          <th>Cash Ende</th>
                          <th>Einnahmen</th>
                          <th>Ausgaben</th>
                          <th>Nettovermögen</th>
                          <th>Immobilienwert</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearlyData.map((year, index) => (
                          <tr key={index} className={year.endBalance < 0 ? 'negative-balance' : ''}>
                            <td>{year.year}</td>
                            <td>{year.age}</td>
                            <td>{formatters.currency(year.startBalance)}</td>
                            <td>{formatters.currency(year.endBalance)}</td>
                            <td>{formatters.currency(year.totalIncome)}</td>
                            <td>{formatters.currency(year.totalExpenses)}</td>
                            <td>{formatters.currency(year.netWorth)}</td>
                            <td>{formatters.currency(year.propertyValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Einnahmen/Ausgaben Zusammenfassung */}
            <div className="summary-section">
              <button 
                className="summary-toggle"
                onClick={() => setExpandedSections(prev => ({...prev, incomeSummary: !prev.incomeSummary}))}
              >
                <span>💰 Einnahmenübersicht</span>
                <span className={`toggle-icon ${expandedSections.incomeSummary ? 'expanded' : ''}`}>▼</span>
              </button>
              
              {expandedSections.incomeSummary && (
                <div className="summary-content">
                  <div className="summary-grid">
                    <div className="summary-column">
                      <h4>Einnahmequellen</h4>
                      <div className="summary-items">
                        {incomeExpenseSummary.income.map((item, index) => (
                          <div key={index} className="summary-item">
                            <span className="item-label">{item.category}</span>
                            <span className="item-values">
                              <span className="monthly">{formatters.currency(item.monthly)}/Monat</span>
                              <span className="yearly">{formatters.currency(item.yearly)}/Jahr</span>
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="summary-total">
                        <span>Gesamt:</span>
                        <span>
                          {formatters.currency(incomeExpenseSummary.income.reduce((sum, item) => sum + item.yearly, 0))}/Jahr
                        </span>
                      </div>
                    </div>
                    
                    {incomeExpenseSummary.propertyDetails.length > 0 && (
                      <div className="summary-column">
                        <h4>Immobilien-Details</h4>
                        <div className="property-details">
                          {incomeExpenseSummary.propertyDetails.map((property, index) => (
                            <div key={index} className="property-item">
                              <h5>{property.name}</h5>
                              <div className="property-stats">
                                <div className="stat">
                                  <span>Mieteinnahmen:</span>
                                  <span>{formatters.currency(property.yearlyRent)}/Jahr</span>
                                </div>
                                <div className="stat">
                                  <span>Instandhaltung:</span>
                                  <span className="negative">{formatters.currency(property.yearlyMaintenance)}/Jahr</span>
                                </div>
                                <div className="stat">
                                  <span>Netto-Ertrag:</span>
                                  <span className={property.netIncome >= 0 ? 'positive' : 'negative'}>
                                    {formatters.currency(property.netIncome)}/Jahr
                                  </span>
                                </div>
                                <div className="stat">
                                  <span>Rendite:</span>
                                  <span className={property.yield >= 0 ? 'positive' : 'negative'}>
                                    {property.yield.toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="summary-section">
              <button 
                className="summary-toggle"
                onClick={() => setExpandedSections(prev => ({...prev, expenseSummary: !prev.expenseSummary}))}
              >
                <span>📝 Ausgabenübersicht</span>
                <span className={`toggle-icon ${expandedSections.expenseSummary ? 'expanded' : ''}`}>▼</span>
              </button>
              
              {expandedSections.expenseSummary && (
                <div className="summary-content">
                  <div className="summary-column">
                    <h4>Ausgabenkategorien</h4>
                    <div className="summary-items">
                      {incomeExpenseSummary.expenses.map((item, index) => (
                        <div key={index} className="summary-item">
                          <span className="item-label">{item.category}</span>
                          <span className="item-values">
                            <span className="monthly">{formatters.currency(item.monthly)}/Monat</span>
                            <span className="yearly">{formatters.currency(item.yearly)}/Jahr</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="summary-total">
                      <span>Gesamt:</span>
                      <span>
                        {formatters.currency(incomeExpenseSummary.expenses.reduce((sum, item) => sum + item.yearly, 0))}/Jahr
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hauptgraph */}
            <div className="chart-container">
              <div className="chart-header">
                <h2>Vermögensentwicklung</h2>
              </div>
              <div className="chart-wrapper">
                {chartData.labels.length > 0 && <Line data={chartData} options={chartOptions} />}
              </div>
            </div>

            {/* Ausgaben-Breakdown Monatlich */}
            <div className="expense-breakdown">
              <div className="chart-header">
                <h2>Ausgabenkategorien (monatlich)</h2>
                {expenseChartData.monthly && (
                  <div className="total-expenses">
                    Gesamt: {formatters.currency(expenseChartData.monthly.total)} / Monat
                  </div>
                )}
              </div>
              <div className="chart-wrapper doughnut-chart">
                {expenseChartData.monthly && <Doughnut data={expenseChartData.monthly} options={doughnutOptions} />}
              </div>
            </div>

            {/* Ausgaben-Breakdown Jährlich */}
            <div className="expense-breakdown">
              <div className="chart-header">
                <h2>Ausgabenkategorien (jährlich)</h2>
                {expenseChartData.yearly && (
                  <div className="total-expenses">
                    Gesamt: {formatters.currency(expenseChartData.yearly.total)} / Jahr
                  </div>
                )}
              </div>
              <div className="chart-wrapper doughnut-chart">
                {expenseChartData.yearly && <Doughnut data={expenseChartData.yearly} options={doughnutOptions} />}
              </div>
            </div>

            {/* Temporär entfernt: Sankey-Diagramm für Ausgabenverteilung */}
            {/* <ExpenseSankeyChart financialData={financialData} /> */}

            {/* Warnungen */}
            {projection.monthlyResults && projection.monthlyResults.some(r => r.cashBalance < 0) && (
              <div className="warning-section">
                <div className="warning-card">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-content">
                    <h3>Liquiditätswarnung</h3>
                    <p>Der Cash-Bestand wird voraussichtlich in Jahr {projection.kpis.coverageUntilYear} negativ.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'income' && (
          <EinkommenSection 
            data={financialData.income}
            onChange={(newIncome) => setFinancialData(prev => ({ ...prev, income: newIncome }))}
          />
        )}

        {activeTab === 'expenses' && (
          <AusgabenSection 
            data={financialData.expenses}
            onChange={(newExpenses) => setFinancialData(prev => ({ ...prev, expenses: newExpenses }))}
          />
        )}

        {activeTab === 'properties' && (
          <ImmobilienManager 
            properties={financialData.properties}
            onChange={(newProperties) => setFinancialData(prev => ({ ...prev, properties: newProperties }))}
          />
        )}

        {activeTab === 'assumptions' && (
          <AnnahmenParameterTest 
            data={financialData.assumptions}
            initialCash={financialData.initialCash}
            onChange={(newAssumptions) => setFinancialData(prev => ({ ...prev, assumptions: newAssumptions }))}
            onInitialCashChange={(newCash) => setFinancialData(prev => ({ ...prev, initialCash: newCash }))}
            stressTests={stressTests}
          />
        )}
      </main>

      {/* Transparenz-Panel */}
      <button 
        className="transparency-toggle"
        onClick={() => setShowTransparency(!showTransparency)}
      >
        {showTransparency ? '📖 Methodik verbergen' : '📖 Methodik & Berechnung'}
      </button>

      {showTransparency && (
        <div className="transparency-panel">
          <div className="transparency-content">
            <div className="transparency-header">
              <h2>Berechnungsmethodik</h2>
              <button 
                className="transparency-close"
                onClick={() => setShowTransparency(false)}
                aria-label="Schließen"
              >
                ✕
              </button>
            </div>
            
            <div className="methodology-section">
              <h3>🧮 Einkommensteuer</h3>
              <p>Basiert auf dem deutschen Einkommensteuertarif 2024/2025:</p>
              <ul>
                <li>Grundfreibetrag: 11.604 €</li>
                <li>Progressionszonen mit entsprechenden Formeln</li>
                <li>Solidaritätszuschlag: 5,5% (ab Freigrenze)</li>
              </ul>
            </div>

            <div className="methodology-section">
              <h3>🏥 Gesetzliche Krankenversicherung</h3>
              <p>Berechnung nach aktuellen Sätzen:</p>
              <ul>
                <li>Allgemeiner Beitragssatz: 14,6%</li>
                <li>Zusatzbeitrag: 1,3% (durchschnittlich)</li>
                <li>Mindesteinkommen: 1.131,67 € monatlich</li>
                <li>Beitragsbemessungsgrenze: 5.175 € monatlich</li>
              </ul>
            </div>

            <div className="methodology-section">
              <h3>🏠 Immobilien-AfA</h3>
              <p>Abschreibung für Abnutzung:</p>
              <ul>
                <li>Basis: Kaufpreis minus Grundstückswert</li>
                <li>Standard-Satz: 2% linear</li>
                <li>Nur steuerlich wirksam, nicht cashflow-relevant</li>
              </ul>
            </div>

            <div className="methodology-section">
              <h3>📈 Inflations- und Wachstumsanpassungen</h3>
              <ul>
                <li>Einnahmen: Jährliche Steigerung nach Einkommenswachstumsrate</li>
                <li>Ausgaben: Jährliche Steigerung nach Ausgabenwachstumsrate</li>
                <li>Immobilienwerte: Standardmäßig 2% p.a.</li>
                <li>Cash-Zinsen: Monatlich auf aktuellen Bestand</li>
              </ul>
            </div>

            <div className="methodology-section">
              <h3>🎯 Stress-Tests</h3>
              <p>Verschiedene Szenarien werden automatisch berechnet:</p>
              <ul>
                <li>Basisszenario: Aktuelle Annahmen</li>
                <li>Inflationsszenario: +2% Inflation</li>
                <li>Niedrigzins: -1% Sparrendite</li>
                <li>Kombiniert: Beide Faktoren gemeinsam</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanzplanungElke;
