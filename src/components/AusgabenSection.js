import React, { useState } from 'react';
import { formatters } from '../utils/calculations';

const AusgabenSection = ({ data, onChange }) => {
  const [showOneTimeForm, setShowOneTimeForm] = useState(false);
  const [newOneTime, setNewOneTime] = useState({
    month: 0,
    amount: 0,
    name: ''
  });

  const handleFixedExpenseChange = (field, value) => {
    onChange({
      ...data,
      [field]: Number(value)
    });
  };

  const handleAddOneTime = () => {
    if (newOneTime.amount > 0 && newOneTime.name) {
      onChange({
        ...data,
        oneTime: [...(data.oneTime || []), { ...newOneTime, id: Date.now() }]
      });
      setNewOneTime({ month: 0, amount: 0, name: '' });
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

  const totalFixedExpenses = (data.housing || 0) + (data.otherInsurance || 0);
  const totalVariableExpenses = (data.groceries || 0) + (data.leisure || 0);
  const totalMonthlyExpenses = totalFixedExpenses + totalVariableExpenses;
  const totalOneTimeExpenses = (data.oneTime || []).reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="expenses-section">
      {/* Übersicht */}
      <div className="form-section">
        <h2>📝 Ausgaben-Übersicht</h2>
        <div className="expense-summary">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Fixkosten (monatlich):</span>
              <span className="summary-value">{formatters.currency(totalFixedExpenses)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Variable Kosten (monatlich):</span>
              <span className="summary-value">{formatters.currency(totalVariableExpenses)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Gesamt monatlich:</span>
              <span className="summary-value total">{formatters.currency(totalMonthlyExpenses)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Einmalige Ausgaben (gesamt):</span>
              <span className="summary-value">{formatters.currency(totalOneTimeExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixkosten */}
      <div className="form-section">
        <h2>🏠 Fixkosten</h2>
        
        <div className="form-group">
          <label htmlFor="housing">
            Wohnen (Miete, Nebenkosten, Strom)
            <div className="tooltip">
              ℹ️
              <span className="tooltiptext">
                Warmmiete inkl. Nebenkosten, Strom, Internet, GEZ. Wird jährlich um die Ausgabenwachstumsrate angepasst.
              </span>
            </div>
          </label>
          <div className="input-with-currency">
            <input
              id="housing"
              type="number"
              value={data.housing || 0}
              onChange={(e) => handleFixedExpenseChange('housing', e.target.value)}
              placeholder="z.B. 800"
            />
            <span className="currency-symbol">€</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="otherInsurance">
            Weitere Versicherungen
            <div className="tooltip">
              ℹ️
              <span className="tooltiptext">
                Haftpflicht, Hausrat, Rechtsschutz etc. (ohne GKV - wird automatisch berechnet)
              </span>
            </div>
          </label>
          <div className="input-with-currency">
            <input
              id="otherInsurance"
              type="number"
              value={data.otherInsurance || 0}
              onChange={(e) => handleFixedExpenseChange('otherInsurance', e.target.value)}
              placeholder="z.B. 150"
            />
            <span className="currency-symbol">€</span>
          </div>
        </div>

        <div className="info-box">
          <h4>🏥 Gesetzliche Krankenversicherung (GKV)</h4>
          <p>
            Die GKV wird automatisch berechnet basierend auf Ihrem Gesamteinkommen:
            <br />• Beitragssatz: 14,6% + 1,3% Zusatzbeitrag
            <br />• Mindesteinkommen: 1.131,67 € monatlich
            <br />• Beitragsbemessungsgrenze: 5.175 € monatlich
          </p>
        </div>
      </div>

      {/* Variable Kosten */}
      <div className="form-section">
        <h2>🛒 Variable Kosten</h2>
        
        <div className="form-group">
          <label htmlFor="groceries">
            Lebensmittel & Haushalt
            <div className="tooltip">
              ℹ️
              <span className="tooltiptext">
                Einkäufe für Lebensmittel, Drogerie, Haushaltswaren. Wird jährlich um die Inflationsrate angepasst.
              </span>
            </div>
          </label>
          <div className="input-with-currency">
            <input
              id="groceries"
              type="number"
              value={data.groceries || 0}
              onChange={(e) => handleFixedExpenseChange('groceries', e.target.value)}
              placeholder="z.B. 400"
            />
            <span className="currency-symbol">€</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="leisure">
            Freizeit & Sonstiges
            <div className="tooltip">
              ℹ️
              <span className="tooltiptext">
                Restaurants, Kultur, Sport, Reisen, Kleidung, persönliche Ausgaben etc.
              </span>
            </div>
          </label>
          <div className="input-with-currency">
            <input
              id="leisure"
              type="number"
              value={data.leisure || 0}
              onChange={(e) => handleFixedExpenseChange('leisure', e.target.value)}
              placeholder="z.B. 300"
            />
            <span className="currency-symbol">€</span>
          </div>
        </div>
      </div>

      {/* Einmalige Ausgaben */}
      <div className="form-section">
        <h2>💸 Einmalige Ausgaben</h2>
        
        {!showOneTimeForm && (
          <button 
            className="button-primary"
            onClick={() => setShowOneTimeForm(true)}
          >
            + Einmalige Ausgabe hinzufügen
          </button>
        )}

        {showOneTimeForm && (
          <div className="one-time-form">
            <h3>Neue einmalige Ausgabe</h3>
            
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
                    placeholder="z.B. 2500"
                  />
                  <span className="currency-symbol">€</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Bezeichnung</label>
              <input
                type="text"
                value={newOneTime.name}
                onChange={(e) => setNewOneTime(prev => ({...prev, name: e.target.value}))}
                placeholder="z.B. Waschmaschine, Urlaub, Auto-Reparatur..."
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
                  setNewOneTime({ month: 0, amount: 0, name: '' });
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Liste der einmaligen Ausgaben */}
        {data.oneTime && data.oneTime.length > 0 && (
          <div className="one-time-list">
            <h3>Geplante einmalige Ausgaben</h3>
            {data.oneTime
              .sort((a, b) => a.month - b.month)
              .map((item) => (
                <div key={item.id} className="one-time-item">
                  <div className="item-info">
                    <div className="item-title">{item.name}</div>
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

        <div className="info-box">
          <h4>💡 Tipps für einmalige Ausgaben</h4>
          <ul>
            <li><strong>Haushaltsgeräte:</strong> Kühlschrank, Waschmaschine (alle 10-15 Jahre)</li>
            <li><strong>Fahrzeug:</strong> Reparaturen, TÜV, evtl. Neukauf</li>
            <li><strong>Wohnung:</strong> Renovierungen, neue Möbel</li>
            <li><strong>Gesundheit:</strong> Zahnersatz, Brille</li>
            <li><strong>Reisen:</strong> Größere Urlaubsreisen</li>
          </ul>
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
            <p>
              Anteil Wohnkosten am Gesamtbudget: {
                totalMonthlyExpenses > 0 
                  ? formatters.percentage((data.housing || 0) / totalMonthlyExpenses)
                  : '0%'
              }
              <br />
              <small>Empfehlung: max. 30-40% der Gesamtausgaben</small>
            </p>
          </div>
          
          <div className="analysis-item">
            <h4>⚖️ Fix- vs. Variable Kosten</h4>
            <p>
              Fixkosten: {totalMonthlyExpenses > 0 ? formatters.percentage(totalFixedExpenses / totalMonthlyExpenses) : '0%'} • 
              Variable: {totalMonthlyExpenses > 0 ? formatters.percentage(totalVariableExpenses / totalMonthlyExpenses) : '0%'}
              <br />
              <small>Ein höherer Anteil variabler Kosten bietet mehr Flexibilität</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AusgabenSection;
