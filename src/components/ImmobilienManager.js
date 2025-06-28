import React, { useState } from 'react';
import { formatters, calculatePropertyCashflow, calculateDepreciation } from '../utils/calculations';

const ImmobilienManager = ({ properties, onChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [newProperty, setNewProperty] = useState({
    name: '',
    monthlyRent: 0,
    vacancyRate: 5,
    annualMaintenance: 0,
    currentValue: 0,
    afaActive: false,
    afaRate: 2,
    afaRemainingYears: 0,
    purchasePrice: 0,
    landValue: 0,
    plannedSale: null
  });

  const handleAddProperty = () => {
    if (newProperty.name && newProperty.monthlyRent > 0) {
      const property = {
        ...newProperty,
        id: Date.now()
      };
      onChange([...properties, property]);
      setNewProperty({
        name: '',
        monthlyRent: 0,
        vacancyRate: 5,
        annualMaintenance: 0,
        currentValue: 0,
        afaActive: false,
        afaRate: 2,
        afaRemainingYears: 0,
        purchasePrice: 0,
        landValue: 0,
        plannedSale: null
      });
      setShowAddForm(false);
    }
  };

  const handleUpdateProperty = (id, updates) => {
    onChange(properties.map(prop => 
      prop.id === id ? { ...prop, ...updates } : prop
    ));
  };

  const handleDeleteProperty = (id) => {
    onChange(properties.filter(prop => prop.id !== id));
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setNewProperty({ ...property });
    setShowAddForm(true);
  };

  const handleSaveEdit = () => {
    if (editingProperty) {
      handleUpdateProperty(editingProperty.id, newProperty);
      setEditingProperty(null);
      setNewProperty({
        name: '',
        monthlyRent: 0,
        vacancyRate: 5,
        annualMaintenance: 0,
        currentValue: 0,
        afaActive: false,
        afaRate: 2,
        afaRemainingYears: 0,
        purchasePrice: 0,
        landValue: 0,
        plannedSale: null
      });
      setShowAddForm(false);
    }
  };

  const cancelEdit = () => {
    setEditingProperty(null);
    setNewProperty({
      name: '',
      monthlyRent: 0,
      vacancyRate: 5,
      annualMaintenance: 0,
      currentValue: 0,
      afaActive: false,
      afaRate: 2,
      afaRemainingYears: 0,
      purchasePrice: 0,
      landValue: 0,
      plannedSale: null
    });
    setShowAddForm(false);
  };

  const togglePlannedSale = (property) => {
    const updates = {
      plannedSale: property.plannedSale ? null : { year: new Date().getFullYear() + 1, price: property.currentValue }
    };
    handleUpdateProperty(property.id, updates);
  };

  // Berechnungen für Übersicht
  const totalMonthlyRent = properties.reduce((sum, prop) => sum + (prop.monthlyRent || 0), 0);
  const totalPropertyValue = properties.reduce((sum, prop) => sum + (prop.currentValue || 0), 0);
  const totalAnnualMaintenance = properties.reduce((sum, prop) => sum + (prop.annualMaintenance || 0), 0);
  const totalAnnualAfa = properties.reduce((sum, prop) => sum + calculateDepreciation(prop), 0);

  return (
    <div className="immobilien-section">
      {/* Immobilienliste */}
      <div className="form-section">
        <div className="section-header">
          <h2>🏢 Ihre Immobilien</h2>
          {!showAddForm && (
            <button 
              className="button-primary"
              onClick={() => setShowAddForm(true)}
            >
              + Neue Immobilie hinzufügen
            </button>
          )}
        </div>

        {/* Formular für neue/bearbeitete Immobilie */}
        {showAddForm && (
          <div className="property-form">
            <h3>{editingProperty ? 'Immobilie bearbeiten' : 'Neue Immobilie hinzufügen'}</h3>
            
            <div className="form-group">
              <label>Bezeichnung</label>
              <input
                type="text"
                value={newProperty.name}
                onChange={(e) => setNewProperty(prev => ({...prev, name: e.target.value}))}
                placeholder="z.B. Wohnung Musterstraße 123"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Monatliche Miete (kalt)
                  <div className="tooltip">
                    ℹ️
                    <span className="tooltiptext">
                      Kaltmiete ohne Nebenkosten. Diese wird für die Cashflow-Berechnung verwendet.
                    </span>
                  </div>
                </label>
                <div className="input-with-currency">
                  <input
                    type="number"
                    value={newProperty.monthlyRent}
                    onChange={(e) => setNewProperty(prev => ({...prev, monthlyRent: Number(e.target.value)}))}
                    placeholder="z.B. 1200"
                  />
                  <span className="currency-symbol">€</span>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Leerstand (%)
                  <div className="tooltip">
                    ℹ️
                    <span className="tooltiptext">
                      Durchschnittlicher Leerstand pro Jahr. Typisch: 2-10%. Reduziert die effektiven Mieteinnahmen.
                    </span>
                  </div>
                </label>
                <div className="input-with-percent">
                  <input
                    type="number"
                    step="0.1"
                    value={newProperty.vacancyRate}
                    onChange={(e) => setNewProperty(prev => ({...prev, vacancyRate: Number(e.target.value)}))}
                    placeholder="5"
                  />
                  <span className="percent-symbol">%</span>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Instandhaltung & Renovierungen (jährlich)
                  <div className="tooltip">
                    ℹ️
                    <span className="tooltiptext">
                      Jährliche Kosten für Reparaturen, Renovierungen, Verwaltung. Richtwert: 1-3% des Immobilienwerts.
                    </span>
                  </div>
                </label>
                <div className="input-with-currency">
                  <input
                    type="number"
                    value={newProperty.annualMaintenance}
                    onChange={(e) => setNewProperty(prev => ({...prev, annualMaintenance: Number(e.target.value)}))}
                    placeholder="z.B. 2400"
                  />
                  <span className="currency-symbol">€</span>
                </div>
              </div>

              <div className="form-group">
                <label>Aktueller Marktwert</label>
                <div className="input-with-currency">
                  <input
                    type="number"
                    value={newProperty.currentValue}
                    onChange={(e) => setNewProperty(prev => ({...prev, currentValue: Number(e.target.value)}))}
                    placeholder="z.B. 250000"
                  />
                  <span className="currency-symbol">€</span>
                </div>
              </div>
            </div>

            {/* AfA-Bereich */}
            <div className="afa-section">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newProperty.afaActive}
                    onChange={(e) => setNewProperty(prev => ({...prev, afaActive: e.target.checked}))}
                  />
                  AfA (Abschreibung für Abnutzung) aktiv
                  <div className="tooltip">
                    ℹ️
                    <span className="tooltiptext">
                      Lineare Abschreibung für steuerliche Zwecke. Reduziert das zu versteuernde Einkommen, aber nicht den Cashflow.
                    </span>
                  </div>
                </label>
              </div>

              {newProperty.afaActive && (
                <div className="afa-details">
                  <div className="form-row">
                    <div className="form-group">
                      <label>AfA-Satz (%)</label>
                      <div className="input-with-percent">
                        <input
                          type="number"
                          step="0.1"
                          value={newProperty.afaRate}
                          onChange={(e) => setNewProperty(prev => ({...prev, afaRate: Number(e.target.value)}))}
                          placeholder="2"
                        />
                        <span className="percent-symbol">%</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Verbleibende Jahre</label>
                      <input
                        type="number"
                        value={newProperty.afaRemainingYears}
                        onChange={(e) => setNewProperty(prev => ({...prev, afaRemainingYears: Number(e.target.value)}))}
                        placeholder="z.B. 25"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Ursprünglicher Kaufpreis</label>
                      <div className="input-with-currency">
                        <input
                          type="number"
                          value={newProperty.purchasePrice}
                          onChange={(e) => setNewProperty(prev => ({...prev, purchasePrice: Number(e.target.value)}))}
                          placeholder="z.B. 200000"
                        />
                        <span className="currency-symbol">€</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        Grundstückswert (nicht abschreibbar)
                        <div className="tooltip">
                          ℹ️
                          <span className="tooltiptext">
                            Nur das Gebäude kann abgeschrieben werden, nicht das Grundstück. Typisch: 20-30% des Kaufpreises.
                          </span>
                        </div>
                      </label>
                      <div className="input-with-currency">
                        <input
                          type="number"
                          value={newProperty.landValue}
                          onChange={(e) => setNewProperty(prev => ({...prev, landValue: Number(e.target.value)}))}
                          placeholder="z.B. 50000"
                        />
                        <span className="currency-symbol">€</span>
                      </div>
                    </div>
                  </div>

                  {newProperty.afaActive && newProperty.purchasePrice > 0 && (
                    <div className="afa-calculation">
                      <p>
                        <strong>Jährliche AfA:</strong> {formatters.currency(calculateDepreciation(newProperty))}
                        <br />
                        <small>
                          Basis: {formatters.currency(newProperty.purchasePrice - (newProperty.landValue || 0))} 
                          × {newProperty.afaRate}%
                        </small>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                className="button-primary" 
                onClick={editingProperty ? handleSaveEdit : handleAddProperty}
              >
                {editingProperty ? 'Speichern' : 'Hinzufügen'}
              </button>
              <button className="button-secondary" onClick={cancelEdit}>
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Liste der Immobilien */}
        {properties.length === 0 ? (
          <div className="empty-state">
            <p>🏠 Noch keine Immobilien erfasst. Fügen Sie Ihre erste Immobilie hinzu, um die Finanzplanung zu starten.</p>
          </div>
        ) : (
          <div className="properties-list">
            {properties.map((property) => {
              const cashflow = calculatePropertyCashflow(property);
              const annualAfa = calculateDepreciation(property);
              
              return (
                <div key={property.id} className="property-card">
                  <div className="property-header">
                    <h3>{property.name}</h3>
                    <div className="property-actions">
                      <button 
                        className="button-secondary"
                        onClick={() => handleEditProperty(property)}
                      >
                        Bearbeiten
                      </button>
                      <button 
                        className="button-danger"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>

                  <div className="property-details">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Monatliche Miete:</span>
                        <span className="detail-value">{formatters.currency(property.monthlyRent)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Effektive Miete (nach Leerstand):</span>
                        <span className="detail-value">{formatters.currency(cashflow.effectiveRent)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Monatliche Instandhaltung:</span>
                        <span className="detail-value">-{formatters.currency(cashflow.maintenance)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Netto-Cashflow (monatlich):</span>
                        <span className={`detail-value ${cashflow.netCashflow >= 0 ? 'positive' : 'negative'}`}>
                          {formatters.currency(cashflow.netCashflow)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Immobilienwert:</span>
                        <span className="detail-value">{formatters.currency(property.currentValue)}</span>
                      </div>
                      {property.afaActive && (
                        <div className="detail-item">
                          <span className="detail-label">AfA (jährlich, steuerlich):</span>
                          <span className="detail-value">{formatters.currency(annualAfa)}</span>
                        </div>
                      )}
                    </div>

                    {/* Verkaufsplanung */}
                    <div className="sale-planning">
                      <button 
                        className={`button-secondary ${property.plannedSale ? 'active' : ''}`}
                        onClick={() => togglePlannedSale(property)}
                      >
                        {property.plannedSale ? '📅 Verkauf geplant' : '📅 Verkauf planen'}
                      </button>
                      
                      {property.plannedSale && (
                        <div className="sale-details">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Verkaufsjahr</label>
                              <input
                                type="number"
                                value={property.plannedSale.year}
                                onChange={(e) => handleUpdateProperty(property.id, {
                                  plannedSale: { ...property.plannedSale, year: Number(e.target.value) }
                                })}
                                min={new Date().getFullYear()}
                              />
                            </div>
                            <div className="form-group">
                              <label>Verkaufspreis</label>
                              <div className="input-with-currency">
                                <input
                                  type="number"
                                  value={property.plannedSale.price}
                                  onChange={(e) => handleUpdateProperty(property.id, {
                                    plannedSale: { ...property.plannedSale, price: Number(e.target.value) }
                                  })}
                                />
                                <span className="currency-symbol">€</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Portfolio-Übersicht */}
      <div className="form-section">
        <h2>🏠 Immobilien-Portfolio Übersicht</h2>
        <div className="portfolio-summary">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Anzahl Objekte:</span>
              <span className="summary-value">{properties.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Gesamtwert:</span>
              <span className="summary-value">{formatters.currency(totalPropertyValue)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Monatliche Mieteinnahmen:</span>
              <span className="summary-value">{formatters.currency(totalMonthlyRent)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Jährliche Instandhaltung:</span>
              <span className="summary-value">{formatters.currency(totalAnnualMaintenance)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Jährliche AfA (steuerlich):</span>
              <span className="summary-value">{formatters.currency(totalAnnualAfa)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Brutto-Mietrendite:</span>
              <span className="summary-value">
                {totalPropertyValue > 0 ? formatters.percentage((totalMonthlyRent * 12) / totalPropertyValue) : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImmobilienManager;
