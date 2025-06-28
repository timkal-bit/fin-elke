import React, { useState } from 'react';
import { formatters } from '../utils/calculations';

const AnnahmenParameterTest = ({ data, initialCash, onChange, onInitialCashChange, stressTests }) => {
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

  return (
    <div className="assumptions-section">
      {/* Startkapital */}
      <div className="form-section">
        <h2>💰 Startkapital</h2>
        <div className="form-group">
          <label>Verfügbares Startkapital</label>
          <div className="input-with-currency">
            <input
              type="number"
              value={initialCash}
              onChange={(e) => onInitialCashChange(Number(e.target.value))}
              min="0"
              step="1000"
            />
            <span className="currency-symbol">€</span>
          </div>
          <p style={{fontSize: '14px', color: '#666', marginTop: '8px'}}>
            Dies ist Ihr liquides Kapital zum Start der Planung.
          </p>
        </div>
      </div>

      {/* Grundannahmen */}
      <div className="form-section">
        <h2>📊 Grundannahmen</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label>Inflationsrate</label>
            <div className="input-with-percent">
              <input
                type="number"
                value={data.inflationRate}
                onChange={(e) => handleChange('inflationRate', e.target.value)}
                min="0"
                max="10"
                step="0.1"
              />
              <span className="percent-symbol">%</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>
              Sparzinsen (Kapitalmarktrendite)
              <div className="tooltip">
                ℹ️
                <span className="tooltiptext">
                  Erwartete jährliche Rendite für Ihr Kapital (Tagesgeld, Festgeld, ETFs, etc.). 
                  Diese wird auf verfügbare Liquidität angewendet.
                </span>
              </div>
            </label>
            <div className="input-with-percent">
              <input
                type="number"
                value={data.savingsReturn}
                onChange={(e) => handleChange('savingsReturn', e.target.value)}
                min="0"
                max="10"
                step="0.1"
              />
              <span className="percent-symbol">%</span>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Einkommenswachstum</label>
            <div className="input-with-percent">
              <input
                type="number"
                value={data.incomeGrowthRate}
                onChange={(e) => handleChange('incomeGrowthRate', e.target.value)}
                min="0"
                max="10"
                step="0.1"
              />
              <span className="percent-symbol">%</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>Ausgabenwachstum</label>
            <div className="input-with-percent">
              <input
                type="number"
                value={data.expenseGrowthRate}
                onChange={(e) => handleChange('expenseGrowthRate', e.target.value)}
                min="0"
                max="10"
                step="0.1"
              />
              <span className="percent-symbol">%</span>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Immobilienwertentwicklung</label>
            <div className="input-with-percent">
              <input
                type="number"
                value={data.propertyValueGrowth}
                onChange={(e) => handleChange('propertyValueGrowth', e.target.value)}
                min="0"
                max="10"
                step="0.1"
              />
              <span className="percent-symbol">%</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>Jährliche Steuerabsetzungen</label>
            <div className="input-with-currency">
              <input
                type="number"
                value={data.annualDeductions}
                onChange={(e) => handleChange('annualDeductions', e.target.value)}
                min="0"
                step="100"
              />
              <span className="currency-symbol">€</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={resetToDefaults}>
            🔄 Auf Standardwerte zurücksetzen
          </button>
        </div>
      </div>

      {/* Stress-Tests */}
      {stressTests && Object.keys(stressTests).length > 0 && (
        <div className="form-section">
          <h2>🎯 Stress-Tests</h2>
          <p className="section-description">
            Verschiedene Szenarien zeigen, wie robust Ihre Finanzplanung ist.
          </p>
          
          <div className="stress-test-grid">
            {Object.entries(stressTests).map(([scenario, results]) => (
              <div 
                key={scenario}
                className={`stress-test-card ${activeStressTest === scenario ? 'active' : ''}`}
                onClick={() => setActiveStressTest(activeStressTest === scenario ? null : scenario)}
              >
                <div className="stress-test-header">
                  <div className="stress-test-icon">
                    {scenario === 'base' ? '📊' : 
                     scenario === 'highInflation' ? '📈' : 
                     scenario === 'lowReturns' ? '📉' : '⚠️'}
                  </div>
                  <div className="stress-test-info">
                    <h3>
                      {scenario === 'base' ? 'Basisszenario' : 
                       scenario === 'highInflation' ? 'Hohe Inflation' : 
                       scenario === 'lowReturns' ? 'Niedrige Zinsen' : 'Kombiniert'}
                    </h3>
                    <p>
                      {scenario === 'base' ? 'Aktuelle Annahmen' : 
                       scenario === 'highInflation' ? '+2% Inflation' : 
                       scenario === 'lowReturns' ? '-1% Sparzinsen' : 'Beide Faktoren'}
                    </p>
                  </div>
                </div>
                
                {results && (
                  <div className="stress-test-results">
                    <div className="result-item">
                      <span className="result-label">Endsaldo</span>
                      <span className={`result-value ${results.finalBalance >= 0 ? 'positive' : 'negative'}`}>
                        {formatters.currency(results.finalBalance || 0)}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Ø Cashflow</span>
                      <span className={`result-value ${(results.averageCashflow || 0) >= 0 ? 'positive' : 'negative'}`}>
                        {formatters.currency(results.averageCashflow || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnahmenParameterTest;
