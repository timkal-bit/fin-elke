import React, { useState } from 'react';
import { formatters } from '../utils/calculations';

const AnnahmenParameter = ({ data, initialCash, onChange, onInitialCashChange, stressTests }) => {
  const [activeStressTest, setActiveStressTest] = useState(null);

  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: Number(value)
    });
  };

  const resetToDefaults = () => {
    onChange({
      inflationRate: 2.5,
      savingsReturn: 3.0,
      incomeGrowthRate: 1.5,
      expenseGrowthRate: 2.0,
      propertyValueGrowth: 2.0,
      annualDeductions: 1000
    });
  };

  const stressTestScenarios = [
    {
      key: 'highVacancy',
      name: 'Hoher Leerstand',
      description: 'Leerstand um 20% erhöht',
      icon: '🏠'
    },
    {
      key: 'highInflation',
      name: 'Hohe Inflation',
      description: 'Inflation um 3% erhöht',
      icon: '📈'
    },
    {
      key: 'lowReturns',
      name: 'Niedrige Zinsen',
      description: 'Sparzinsen um 2% reduziert',
      icon: '📉'
    }
  ];

  return (
    <div className="assumptions-section">
      {/* Startkapital */}
      <div className="form-section">
        <h2>💰 Startkapital</h2>
        <div className="form-group">
          <label htmlFor="initialCash">
            Aktueller Cash-Bestand
            <div className="tooltip">
              ℹ️
              <span className="tooltiptext">
                Ihr verfügbares Geld zu Beginn der Planung. Tagesgeld, Girokonto, Sparbuch etc.
              </span>
            </div>
          </label>
          <div className="input-with-currency">
            <input
              id="initialCash"
              type="number"
              value={initialCash}
              onChange={(e) => onInitialCashChange(Number(e.target.value))}
              placeholder="z.B. 50000"
            />
            <span className="currency-symbol">€</span>
          </div>
        </div>
      </div>

      {/* Wirtschaftliche Annahmen */}
      <div className="form-section">
        <h2>📊 Wirtschaftliche Annahmen</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="inflationRate">
              Inflationsrate (p.a.)
              <div className="tooltip">
                ℹ️
                <span className="tooltiptext">
                  Jährliche Geldentwertung. Historischer Durchschnitt in Deutschland: 2-3%. Beeinflusst die Kaufkraft Ihres Geldes.
                </span>
              </div>
            </label>
            <div className="input-with-percent">
              <input
                id="inflationRate"
                type="number"
                step="0.1"
                value={data.inflationRate}
                onChange={(e) => handleChange('inflationRate', e.target.value)}
                placeholder="2.5"
              />
              <span className="percent-symbol">%</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="savingsReturn">
              Rendite auf Erspartes (p.a.)
              <div className="tooltip">
                ℹ️
                <span className="tooltiptext">
                  Zinssatz auf Ihr Cash-Guthaben. Tagesgeld, Festgeld, sichere Anleihen. Aktuell: 2-4%.
                </span>
              </div>
            </label>
            <div className="input-with-percent">
              <input
                id="savingsReturn"
                type="number"
                step="0.1"
                value={data.savingsReturn}
                onChange={(e) => handleChange('savingsReturn', e.target.value)}
                placeholder="3.0"
              />
              <span className="percent-symbol">%</span>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="incomeGrowthRate">
              Einkommenssteigerung (p.a.)
              <div className="tooltip">
                ℹ️
                <span className="tooltiptext">
                  Jährliche Steigerung Ihrer Einnahmen. Renten-/Pensionserhöhungen, Mietanpassungen. Typisch: 1-2%.
                </span>
              </div>
            </label>
            <div className="input-with-percent">
              <input
                id="incomeGrowthRate"
                type="number"
                step="0.1"
                value={data.incomeGrowthRate}
                onChange={(e) => handleChange('incomeGrowthRate', e.target.value)}
                placeholder="1.5"
              />
              <span className="percent-symbol">%</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="expenseGrowthRate">
              Ausgabensteigerung (p.a.)
              <div className="tooltip">
                ℹ️
                <span className="tooltiptext">
                  Jährliche Steigerung Ihrer Ausgaben durch Inflation. Meist etwas höher als Einkommenssteigerung.
                </span>
              </div>
            </label>
            <div className="input-with-percent">
              <input
                id="expenseGrowthRate"
                type="number"
                step="0.1"
                value={data.expenseGrowthRate}
                onChange={(e) => handleChange('expenseGrowthRate', e.target.value)}
                placeholder="2.0"
              />
              <span className="percent-symbol">%</span>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="propertyValueGrowth">
              Immobilienwertsteigerung (p.a.)
              <div className="tooltip">
                ℹ️
                <span className="tooltiptext">
                  Jährliche Wertsteigerung Ihrer Immobilien. Langfristiger Durchschnitt: 2-3% p.a.
                </span>
              </div>
            </label>
            <div className="input-with-percent">
              <input
                id="propertyValueGrowth"
                type="number"
                step="0.1"
                value={data.propertyValueGrowth}
                onChange={(e) => handleChange('propertyValueGrowth', e.target.value)}
                placeholder="2.0"
              />
              <span className="percent-symbol">%</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="annualDeductions">
              Sonstige Steuerabzüge (jährlich)
              <div className="tooltip">
                ℹ️
                <span className="tooltiptext">
                  Werbungskosten, Sonderausgaben, außergewöhnliche Belastungen. Pauschalbetrag für Vereinfachung.
                </span>
              </div>
            </label>
            <div className="input-with-currency">
              <input
                id="annualDeductions"
                type="number"
                value={data.annualDeductions}
                onChange={(e) => handleChange('annualDeductions', e.target.value)}
                placeholder="1000"
              />
              <span className="currency-symbol">€</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="button-secondary" onClick={resetToDefaults}>
            🔄 Auf Standardwerte zurücksetzen
          </button>
        </div>
      </div>

      {/* Stress-Tests */}
      <div className="form-section">
        <h2>🧪 Stress-Test Szenarien</h2>
        <p className="section-description">
          Testen Sie, wie sich Ihre Finanzplanung unter verschiedenen Krisenbedingungen entwickelt.
        </p>

        <div className="stress-test-grid">
          {stressTestScenarios.map((scenario) => {
            const testResult = stressTests?.[scenario.key];
            const isActive = activeStressTest === scenario.key;
            
            return (
              <div 
                key={scenario.key} 
                className={`stress-test-card ${isActive ? 'active' : ''}`}
                onClick={() => setActiveStressTest(isActive ? null : scenario.key)}
              >
                <div className="stress-test-header">
                  <div className="stress-test-icon">{scenario.icon}</div>
                  <div className="stress-test-info">
                    <h3>{scenario.name}</h3>
                    <p>{scenario.description}</p>
                  </div>
                </div>

                {testResult && (
                  <div className="stress-test-results">
                    <div className="result-item">
                      <span className="result-label">Ø Cashflow:</span>
                      <span className={`result-value ${testResult.kpis.averageMonthlyCashflow >= 0 ? 'positive' : 'negative'}`}>
                        {formatters.currency(testResult.kpis.averageMonthlyCashflow)}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Deckung bis:</span>
                      <span className="result-value">
                        Jahr {testResult.kpis.coverageUntilYear}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">End-Vermögen:</span>
                      <span className={`result-value ${testResult.kpis.finalNetWorth >= 0 ? 'positive' : 'negative'}`}>
                        {formatters.currency(testResult.kpis.finalNetWorth)}
                      </span>
                    </div>
                  </div>
                )}

                {!testResult && (
                  <div className="stress-test-loading">
                    Berechnung läuft...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Steuerliche Einstellungen */}
      <div className="form-section info-section">
        <h2>🧮 Steuerliche Details</h2>
        <div className="tax-details">
          <div className="tax-detail-item">
            <h4>📋 Automatische Berechnungen</h4>
            <p>Das System berechnet automatisch:</p>
            <ul>
              <li>Einkommensteuer nach deutschem Tarif 2024/2025</li>
              <li>Solidaritätszuschlag (5,5% ab Freigrenze)</li>
              <li>GKV-Beiträge (14,6% + 1,3% Zusatzbeitrag)</li>
              <li>AfA-Abschreibungen für Immobilien</li>
            </ul>
          </div>

          <div className="tax-detail-item">
            <h4>🏠 Immobilien-Besonderheiten</h4>
            <ul>
              <li>Mieteinnahmen sind steuerpflichtig</li>
              <li>Werbungskosten (Instandhaltung) sind abzugsfähig</li>
              <li>AfA reduziert nur Steuerlast, nicht Cashflow</li>
              <li>Verkaufsgewinne nach 10 Jahren steuerfrei</li>
            </ul>
          </div>

          <div className="tax-detail-item">
            <h4>⚠️ Vereinfachungen</h4>
            <p>Diese Berechnung verwendet Vereinfachungen:</p>
            <ul>
              <li>Keine Kirchensteuer berücksichtigt</li>
              <li>Pauschalabzüge statt detaillierter Werbungskosten</li>
              <li>Keine Kapitalertragssteuer auf Zinsen</li>
              <li>Vereinfachte Immobilien-Steuerberechnung</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Empfehlungen */}
      <div className="form-section recommendations-section">
        <h2>💡 Planungs-Empfehlungen</h2>
        <div className="recommendations-grid">
          <div className="recommendation-item">
            <h4>🎯 Konservative Planung</h4>
            <p>
              <strong>Inflation:</strong> 3,0%<br />
              <strong>Zinsen:</strong> 2,5%<br />
              <strong>Einkommenssteigerung:</strong> 1,0%<br />
              <small>Für vorsichtige Planer</small>
            </p>
          </div>

          <div className="recommendation-item">
            <h4>📊 Realistische Planung</h4>
            <p>
              <strong>Inflation:</strong> 2,5%<br />
              <strong>Zinsen:</strong> 3,0%<br />
              <strong>Einkommenssteigerung:</strong> 1,5%<br />
              <small>Basierend auf historischen Daten</small>
            </p>
          </div>

          <div className="recommendation-item">
            <h4>🚀 Optimistische Planung</h4>
            <p>
              <strong>Inflation:</strong> 2,0%<br />
              <strong>Zinsen:</strong> 4,0%<br />
              <strong>Einkommenssteigerung:</strong> 2,0%<br />
              <small>Bei günstiger Wirtschaftslage</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnahmenParameter;
