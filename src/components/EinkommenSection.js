import React, { useState } from 'react';
import { formatters } from '../utils/calculations';

const EinkommenSection = ({ data, onChange }) => {
  const [showOneTimeForm, setShowOneTimeForm] = useState(false);
  const [newOneTime, setNewOneTime] = useState({
    month: 0,
    amount: 0,
    description: ''
  });

  const handleRegularIncomeChange = (field, value) => {
    onChange({
      ...data,
      [field]: Number(value)
    });
  };

  const handleAddOneTime = () => {
    if (newOneTime.amount > 0 && newOneTime.description) {
      onChange({
        ...data,
        oneTime: [...(data.oneTime || []), { ...newOneTime, id: Date.now() }]
      });
      setNewOneTime({ month: 0, amount: 0, description: '' });
      setShowOneTimeForm(false);
    }
  };

  const handleRemoveOneTime = (id) => {
    onChange({
      ...data,
      oneTime: data.oneTime.filter(item => item.id !== id)
    });
  };

  const getMonthName = (monthIndex) => {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return months[monthIndex] || 'Monat ' + (monthIndex + 1);
  };

  const totalMonthlyIncome = (data.pension || 0) + (data.otherIncome || 0);
  const totalOneTimeIncome = (data.oneTime || []).reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="income-section">
      {/* Übersicht */}
      <div className="form-section">
        <h2>💰 Einnahmen-Übersicht</h2>
        <div className="income-summary">
          <div className="summary-item">
            <span className="summary-label">Monatliche Einnahmen:</span>
            <span className="summary-value">{formatters.currency(totalMonthlyIncome)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Jährliche Einnahmen:</span>
            <span className="summary-value">{formatters.currency(totalMonthlyIncome * 12)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Einmalige Einnahmen (gesamt):</span>
            <span className="summary-value">{formatters.currency(totalOneTimeIncome)}</span>
          </div>
        </div>
      </div>

      {/* Regelmäßige Einnahmen */}
      <div className="form-section">
        <h2>📅 Regelmäßige Einnahmen</h2>
        
        <div className="form-group">
          <label htmlFor="pension">
            Rente (monatlich)
            <div className="tooltip">
              ℹ️
              <span className="tooltiptext">
                Gesetzliche und private Rente, Pensionen. Wird automatisch um die Einkommenswachstumsrate angepasst.
              </span>
            </div>
          </label>
          <div className="input-with-currency">
            <input
              id="pension"
              type="number"
              value={data.pension || 0}
              onChange={(e) => handleRegularIncomeChange('pension', e.target.value)}
              placeholder="z.B. 1800"
            />
            <span className="currency-symbol">€</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="otherIncome">
            Sonstige Nebeneinkünfte (monatlich)
            <div className="tooltip">
              ℹ️
              <span className="tooltiptext">
                Minijobs, Honorare, Zinsen, Dividenden etc. Wird um die Einkommenswachstumsrate angepasst.
              </span>
            </div>
          </label>
          <div className="input-with-currency">
            <input
              id="otherIncome"
              type="number"
              value={data.otherIncome || 0}
              onChange={(e) => handleRegularIncomeChange('otherIncome', e.target.value)}
              placeholder="z.B. 500"
            />
            <span className="currency-symbol">€</span>
          </div>
        </div>

        <div className="info-box">
          <h4>💡 Hinweis zu Immobilieneinnahmen</h4>
          <p>Mieteinnahmen werden separat im Bereich "Immobilien" erfasst, da sie spezielle Berechnungen für Leerstand, Instandhaltung und AfA benötigen.</p>
        </div>
      </div>

      {/* Einmalige Einnahmen */}
      <div className="form-section">
        <h2>💫 Einmalige Einnahmen</h2>
        
        {!showOneTimeForm && (
          <button 
            className="button-primary"
            onClick={() => setShowOneTimeForm(true)}
          >
            + Einmalige Einnahme hinzufügen
          </button>
        )}

        {showOneTimeForm && (
          <div className="one-time-form">
            <h3>Neue einmalige Einnahme</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Monat</label>
                <select
                  value={newOneTime.month}
                  onChange={(e) => setNewOneTime(prev => ({...prev, month: Number(e.target.value)}))}
                >
                  {Array.from({length: 60}, (_, i) => (
                    <option key={i} value={i}>
                      {getMonthName(i % 12)} {Math.floor(i / 12) + 1}. Jahr
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Betrag</label>
                <div className="input-with-currency">
                  <input
                    type="number"
                    value={newOneTime.amount}
                    onChange={(e) => setNewOneTime(prev => ({...prev, amount: Number(e.target.value)}))}
                    placeholder="z.B. 5000"
                  />
                  <span className="currency-symbol">€</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Beschreibung</label>
              <input
                type="text"
                value={newOneTime.description}
                onChange={(e) => setNewOneTime(prev => ({...prev, description: e.target.value}))}
                placeholder="z.B. Steuererstattung, Erbschaft, Verkauf..."
              />
            </div>

            <div className="form-actions">
              <button className="button-primary" onClick={handleAddOneTime}>
                Hinzufügen
              </button>
              <button 
                className="button-secondary" 
                onClick={() => {
                  setShowOneTimeForm(false);
                  setNewOneTime({ month: 0, amount: 0, description: '' });
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Liste der einmaligen Einnahmen */}
        {data.oneTime && data.oneTime.length > 0 && (
          <div className="one-time-list">
            <h3>Geplante einmalige Einnahmen</h3>
            {data.oneTime.map((item) => (
              <div key={item.id} className="one-time-item">
                <div className="item-info">
                  <div className="item-title">{item.description}</div>
                  <div className="item-details">
                    {getMonthName(item.month % 12)} {Math.floor(item.month / 12) + 1}. Jahr • {formatters.currency(item.amount)}
                  </div>
                </div>
                <button 
                  className="button-danger"
                  onClick={() => handleRemoveOneTime(item.id)}
                >
                  Löschen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Steuerliche Hinweise */}
      <div className="form-section info-section">
        <h2>📋 Steuerliche Hinweise</h2>
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
    </div>
  );
};

export default EinkommenSection;
