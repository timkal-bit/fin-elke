import React, { useState, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { calculateFinancialProjection, runStressTests, formatters } from '../utils/calculations';
import EinkommenSection from './EinkommenSection';
import AusgabenSection from './AusgabenSection';
import ImmobilienManager from './ImmobilienManager';
import AnnahmenParameter from './AnnahmenParameter';
import './FinanzplanungElke.css';

// Chart.js registrieren
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FinanzplanungElke = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState(120); // 10 Jahre default
  const [showTransparency, setShowTransparency] = useState(false);
  
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

  // Chart-Daten für Kontostandsverlauf
  const chartData = useMemo(() => {
    if (!projection.monthlyResults || projection.monthlyResults.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = projection.monthlyResults.map((_, index) => {
      const year = Math.floor(index / 12) + 1;
      const month = (index % 12) + 1;
      return `${year}.${month.toString().padStart(2, '0')}`;
    }).filter((_, index) => index % 6 === 0); // Alle 6 Monate

    const cashData = projection.monthlyResults
      .filter((_, index) => index % 6 === 0)
      .map(result => result.cashBalance || 0);

    const netWorthData = projection.monthlyResults
      .filter((_, index) => index % 6 === 0)
      .map(result => result.netWorth || 0);

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
          label: 'Nettovermögen',
          data: netWorthData,
          borderColor: '#34C759',
          backgroundColor: 'rgba(52, 199, 89, 0.1)',
          fill: false,
          tension: 0.4,
          borderWidth: 3
        }
      ]
    };
  }, [projection]);

  // Chart-Daten für Ausgabenkategorien
  const expenseChartData = useMemo(() => {
    if (!projection.monthlyResults || projection.monthlyResults.length === 0) {
      return null;
    }

    const lastMonthResult = projection.monthlyResults[projection.monthlyResults.length - 1];
    if (!lastMonthResult || !lastMonthResult.expenses) return null;

    return {
      labels: ['Wohnen', 'GKV', 'Versicherungen', 'Lebensmittel', 'Freizeit', 'Immobilien', 'Steuern'],
      datasets: [{
        data: [
          lastMonthResult.expenses.housing || 0,
          lastMonthResult.expenses.healthInsurance || 0,
          lastMonthResult.expenses.otherInsurance || 0,
          lastMonthResult.expenses.groceries || 0,
          lastMonthResult.expenses.leisure || 0,
          lastMonthResult.expenses.propertyMaintenance || 0,
          lastMonthResult.expenses.tax || 0
        ],
        backgroundColor: [
          '#FF3B30',
          '#FF9500',
          '#FFCC00',
          '#34C759',
          '#5AC8FA',
          '#AF52DE',
          '#FF2D92'
        ],
        borderWidth: 0
      }]
    };
  }, [projection]);

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

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: function(context) {
            return formatters.currency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return formatters.currency(value);
          }
        }
      }
    }
  };

  return (
    <div className="finanzplanung-elke">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Finanzplanung Elke</h1>
          <div className="header-controls">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="time-range-selector"
            >
              <option value={60}>5 Jahre</option>
              <option value={120}>10 Jahre</option>
              <option value={180}>15 Jahre</option>
              <option value={240}>20 Jahre</option>
            </select>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Übersicht
        </button>
        <button 
          className={`tab-button ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          💰 Einnahmen
        </button>
        <button 
          className={`tab-button ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          📝 Ausgaben
        </button>
        <button 
          className={`tab-button ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          🏠 Immobilien
        </button>
        <button 
          className={`tab-button ${activeTab === 'assumptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('assumptions')}
        >
          ⚙️ Parameter
        </button>
      </nav>

      {/* Hauptinhalt */}
      <main className="main-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* KPI-Kacheln */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon">💶</div>
                <div className="kpi-content">
                  <h3>Ø Monatlicher Cashflow</h3>
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
                  <div className="kpi-value">{projection.kpis.coverageUntilYear}</div>
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-icon">💎</div>
                <div className="kpi-content">
                  <h3>Nettovermögen (Ende)</h3>
                  <div className="kpi-value">{formatters.currency(projection.kpis.finalNetWorth)}</div>
                </div>
              </div>
            </div>

            {/* Hauptgraph */}
            <div className="chart-container">
              <div className="chart-header">
                <h2>Kontostandsverlauf</h2>
              </div>
              <div className="chart-wrapper">
                {chartData.labels.length > 0 && <Line data={chartData} options={chartOptions} />}
              </div>
            </div>

            {/* Ausgaben-Breakdown */}
            <div className="expense-breakdown">
              <div className="chart-header">
                <h2>Ausgabenkategorien (aktuell)</h2>
              </div>
              <div className="chart-wrapper bar-chart">
                {expenseChartData && <Bar data={expenseChartData} options={barChartOptions} />}
              </div>
            </div>

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
          <AnnahmenParameter 
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
            <h2>Berechnungsmethodik</h2>
            
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
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanzplanungElke;
