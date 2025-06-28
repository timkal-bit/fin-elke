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
  const [timeRange, setTimeRange] = useState(120); // 10 Jahre default
  const [showTransparency, setShowTransparency] = useState(false);
  const [currentAge, setCurrentAge] = useState(65); // Aktuelles Alter
  const [showYearlyTable, setShowYearlyTable] = useState(false); // Jahreszusammenfassung
  const [activeTab, setActiveTab] = useState('income'); // Tab-Navigation
  
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

  // Chart-Optionen
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(28, 28, 30, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff',
          callback: function(value) {
            return formatters.currency(value);
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6
      }
    }
  };

  // Jahreszusammenfassung berechnen
  const yearlyData = useMemo(() => {
    if (!projection.monthlyResults || projection.monthlyResults.length === 0) {
      return [];
    }

    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let yearIndex = 0; yearIndex < Math.floor(timeRange / 12); yearIndex++) {
      const startMonthIndex = yearIndex * 12;
      const endMonthIndex = Math.min((yearIndex + 1) * 12 - 1, projection.monthlyResults.length - 1);
      
      if (startMonthIndex >= projection.monthlyResults.length) break;
      
      const startMonth = projection.monthlyResults[startMonthIndex];
      const endMonth = projection.monthlyResults[endMonthIndex];
      
      // Jahreseinnahmen und -ausgaben berechnen
      let totalIncome = 0;
      let totalExpenses = 0;
      
      for (let monthIndex = startMonthIndex; monthIndex <= endMonthIndex && monthIndex < projection.monthlyResults.length; monthIndex++) {
        const month = projection.monthlyResults[monthIndex];
        totalIncome += (month.income?.total || 0);
        totalExpenses += (month.expenses?.total || 0);
      }
      
      years.push({
        year: currentYear + yearIndex,
        age: currentAge + yearIndex,
        startBalance: startMonth.cashBalance || 0,
        endBalance: endMonth.cashBalance || 0,
        totalIncome,
        totalExpenses,
        netWorth: endMonth.netWorth || 0,
        propertyValue: endMonth.propertyValue || 0
      });
    }
    
    return years;
  }, [projection, timeRange, currentAge]);

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

      <main className="main-content">
        {/* KPIs und Charts direkt nach Header */}
        <div className="overview-section">
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

          {/* Vermögensentwicklung */}
          <div className="chart-container">
            <div className="chart-header">
              <h2>Vermögensentwicklung</h2>
            </div>
            <div className="chart-wrapper">
              {chartData.labels.length > 0 && <Line data={chartData} options={chartOptions} />}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
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
        </div>

        {/* Tab Content */}
        <div className="tab-content">
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

        {/* Methodik & Berechnung */}
        <div className="expandable-section">
          <button 
            className={`section-toggle ${showTransparency ? 'active' : ''}`}
            onClick={() => setShowTransparency(!showTransparency)}
          >
            <span>📖 Methodik & Berechnung</span>
            <span className={`toggle-icon ${showTransparency ? 'expanded' : ''}`}>▼</span>
          </button>
          
          {showTransparency && (
            <div className="section-content">
              {/* Steuerliche Hinweise */}
              <div className="form-section info-section">
                <h2>📋 Steuerliche Berechnung</h2>
                <div className="tax-info">
                  <div className="tax-info-item">
                    <h4>🧮 Automatische Steuerberechnung</h4>
                    <p>Das System berechnet automatisch Einkommensteuer und Solidaritätszuschlag basierend auf dem deutschen Steuertarif 2024/2025.</p>
                  </div>
                  
                  <div className="tax-info-item">
                    <h4>🏥 Krankenversicherung</h4>
                    <p>GKV-Beiträge werden automatisch berechnet (14,6% + 1,3% Zusatzbeitrag). Bei geringem Einkommen gilt das Mindesteinkommen von 1.131,67 € monatlich.</p>
                  </div>
                  
                  <div className="tax-info-item">
                    <h4>🏠 Immobilieneinkünfte</h4>
                    <p>Mieteinnahmen werden separat versteuert. AfA-Abschreibungen reduzieren die Steuerlast, nicht aber den Cashflow.</p>
                  </div>
                </div>
              </div>

              {/* Ausgaben-Analyse */}
              <div className="form-section info-section">
                <h2>📊 Ausgaben-Analyse</h2>
                <div className="expense-analysis">
                  <div className="analysis-item">
                    <h4>📈 Inflationsanpassung</h4>
                    <p>Variable Kosten (Lebensmittel, Freizeit) werden jährlich um die Ausgabenwachstumsrate angepasst, um der Inflation zu folgen.</p>
                  </div>
                  
                  <div className="analysis-item">
                    <h4>🏠 Wohnkosten-Anteil</h4>
                    <p>Empfehlung: max. 30-40% der Gesamtausgaben für Wohnkosten</p>
                  </div>
                  
                  <div className="analysis-item">
                    <h4>⚖️ Fix- vs. Variable Kosten</h4>
                    <p>Ein höherer Anteil variabler Kosten bietet mehr Flexibilität bei wirtschaftlichen Schwankungen</p>
                  </div>
                </div>
              </div>

              {/* Immobilien-Tipps */}
              <div className="form-section info-section">
                <h2>💡 Immobilien-Analyse</h2>
                <div className="tips-grid">
                  <div className="tip-item">
                    <h4>🎯 Rendite-Bewertung</h4>
                    <p>
                      <strong>Brutto-Mietrendite:</strong> (Jahresmiete ÷ Kaufpreis) × 100
                      <br />
                      <strong>Netto-Mietrendite:</strong> Nach Abzug aller Kosten
                      <br />
                      <small>Richtwerte: 4-6% brutto, 2-4% netto</small>
                    </p>
                  </div>
                  
                  <div className="tip-item">
                    <h4>🔧 Instandhaltungskosten</h4>
                    <p>
                      Faustregeln für jährliche Instandhaltung:
                      <br />• Neubau: 0,5-1% des Immobilienwerts
                      <br />• Bestand: 1,5-2,5% des Immobilienwerts
                      <br />• Altbau: 2-4% des Immobilienwerts
                    </p>
                  </div>
                  
                  <div className="tip-item">
                    <h4>📊 AfA-Optimierung</h4>
                    <p>
                      <strong>Standard-AfA:</strong> 2% linear über 50 Jahre
                      <br />
                      <strong>Denkmalschutz:</strong> Bis zu 9% in ersten 8 Jahren
                      <br />
                      <small>AfA reduziert nur Steuern, nicht den Cashflow!</small>
                    </p>
                  </div>
                  
                  <div className="tip-item">
                    <h4>🏠 Diversifikation</h4>
                    <p>
                      Risiken streuen durch:
                      <br />• Verschiedene Lagen
                      <br />• Unterschiedliche Objekttypen
                      <br />• Mehrere Mieter
                      <br />• Mix aus Wohn- und Gewerbeimmobilien
                    </p>
                  </div>
                </div>
              </div>

              {/* Technische Details */}
              <div className="form-section info-section">
                <h2>🔢 Technische Berechnungsdetails</h2>
                
                <div className="methodology-section">
                  <h3>💰 Einkommensteuer-Berechnung</h3>
                  <p>Progressiver Steuertarif 2024/2025:</p>
                  <ul>
                    <li>Grundfreibetrag: 11.604 € jährlich</li>
                    <li>Eingangssteuersatz: 14%</li>
                    <li>Spitzensteuersatz: 42% (ab 66.761 €)</li>
                    <li>Reichensteuersatz: 45% (ab 277.826 €)</li>
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
      </main>
    </div>
  );
};

export default FinanzplanungElke;
