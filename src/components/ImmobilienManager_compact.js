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
      resetForm();
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
      resetForm();
    }
  };

  const resetForm = () => {
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
    const updates = property.plannedSale 
      ? { plannedSale: null }
      : { plannedSale: { year: new Date().getFullYear() + 1, salePrice: property.currentValue } };
    
    handleUpdateProperty(property.id, updates);
  };

  // Gesamtwerte berechnen
  const totalValues = properties.reduce((totals, property) => {
    const cashflow = calculatePropertyCashflow(property);
    return {
      monthlyRent: totals.monthlyRent + property.monthlyRent,
      netCashflow: totals.netCashflow + cashflow.netMonthlyCashflow,
      totalValue: totals.totalValue + property.currentValue,
      yearlyMaintenance: totals.yearlyMaintenance + property.annualMaintenance
    };
  }, { monthlyRent: 0, netCashflow: 0, totalValue: 0, yearlyMaintenance: 0 });

  return (
    <>
      {/* Formular für neue/bearbeitete Immobilie */}
      {showAddForm && (
        <div className="form-section">
          <h2>{editingProperty ? '✏️ Bearbeiten' : '➕ Neue Immobilie'}</h2>
          
          <div className="input-grid">
            <div className="input-group">
              <label>Bezeichnung</label>
              <input
                className="input-field"
                type="text"
                value={newProperty.name}
                onChange={(e) => setNewProperty(prev => ({...prev, name: e.target.value}))}
                placeholder="z.B. Wohnung Musterstraße"
              />
            </div>

            <div className="input-group">
              <label>Monatliche Kaltmiete (€)</label>
              <input
                className="input-field"
                type="number"
                value={newProperty.monthlyRent}
                onChange={(e) => setNewProperty(prev => ({...prev, monthlyRent: Number(e.target.value)}))}
                placeholder="1200"
              />
            </div>

            <div className="input-group">
              <label>Leerstand (%)</label>
              <input
                className="input-field"
                type="number"
                step="0.1"
                value={newProperty.vacancyRate}
                onChange={(e) => setNewProperty(prev => ({...prev, vacancyRate: Number(e.target.value)}))}
                placeholder="5"
              />
            </div>

            <div className="input-group">
              <label>Instandhaltung/Jahr (€)</label>
              <input
                className="input-field"
                type="number"
                value={newProperty.annualMaintenance}
                onChange={(e) => setNewProperty(prev => ({...prev, annualMaintenance: Number(e.target.value)}))}
                placeholder="2400"
              />
            </div>

            <div className="input-group">
              <label>Aktueller Wert (€)</label>
              <input
                className="input-field"
                type="number"
                value={newProperty.currentValue}
                onChange={(e) => setNewProperty(prev => ({...prev, currentValue: Number(e.target.value)}))}
                placeholder="250000"
              />
            </div>
          </div>

          {/* AfA-Bereich kompakt */}
          <div className="input-group">
            <label>
              <input
                type="checkbox"
                checked={newProperty.afaActive}
                onChange={(e) => setNewProperty(prev => ({...prev, afaActive: e.target.checked}))}
                style={{ marginRight: '8px' }}
              />
              AfA (Abschreibung) aktivieren
            </label>
          </div>

          {newProperty.afaActive && (
            <div className="input-grid">
              <div className="input-group">
                <label>AfA-Satz (%)</label>
                <input
                  className="input-field"
                  type="number"
                  step="0.1"
                  value={newProperty.afaRate}
                  onChange={(e) => setNewProperty(prev => ({...prev, afaRate: Number(e.target.value)}))}
                  placeholder="2"
                />
              </div>

              <div className="input-group">
                <label>AfA-Jahre</label>
                <input
                  className="input-field"
                  type="number"
                  value={newProperty.afaRemainingYears}
                  onChange={(e) => setNewProperty(prev => ({...prev, afaRemainingYears: Number(e.target.value)}))}
                  placeholder="50"
                />
              </div>

              <div className="input-group">
                <label>Kaufpreis (€)</label>
                <input
                  className="input-field"
                  type="number"
                  value={newProperty.purchasePrice}
                  onChange={(e) => setNewProperty(prev => ({...prev, purchasePrice: Number(e.target.value)}))}
                  placeholder="200000"
                />
              </div>

              <div className="input-group">
                <label>Grundstückswert (€)</label>
                <input
                  className="input-field"
                  type="number"
                  value={newProperty.landValue}
                  onChange={(e) => setNewProperty(prev => ({...prev, landValue: Number(e.target.value)}))}
                  placeholder="50000"
                />
              </div>
            </div>

            {newProperty.afaActive && newProperty.purchasePrice > 0 && newProperty.landValue >= 0 && (
              <div style={{ fontSize: '12px', color: '#a1a1a6', marginTop: '6px' }}>
                AfA-Basis: {formatters.currency(newProperty.purchasePrice - newProperty.landValue)} | 
                Jährlich: {formatters.currency((newProperty.purchasePrice - newProperty.landValue) * (newProperty.afaRate / 100))}
              </div>
            )}
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button 
              className="btn"
              onClick={editingProperty ? handleSaveEdit : handleAddProperty}
            >
              {editingProperty ? '💾 Speichern' : '➕ Hinzufügen'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Portfolio-Übersicht kompakt */}
      <div className="form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2>🏠 Portfolio ({properties.length})</h2>
          {!showAddForm && (
            <button 
              className="btn btn-small"
              onClick={() => setShowAddForm(true)}
            >
              ➕ Hinzufügen
            </button>
          )}
        </div>

        {/* Portfolio-Kennzahlen kompakt */}
        {properties.length > 0 && (
          <div className="input-grid" style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#a1a1a6' }}>
              <strong>Gesamtmiete:</strong><br />
              {formatters.currency(totalValues.monthlyRent)}/Monat
            </div>
            <div style={{ fontSize: '12px', color: '#a1a1a6' }}>
              <strong>Netto-Cashflow:</strong><br />
              {formatters.currency(totalValues.netCashflow)}/Monat
            </div>
            <div style={{ fontSize: '12px', color: '#a1a1a6' }}>
              <strong>Portfolio-Wert:</strong><br />
              {formatters.currency(totalValues.totalValue)}
            </div>
            <div style={{ fontSize: '12px', color: '#a1a1a6' }}>
              <strong>Instandhaltung:</strong><br />
              {formatters.currency(totalValues.yearlyMaintenance)}/Jahr
            </div>
          </div>
        )}

        {/* Immobilienliste kompakt */}
        {properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#a1a1a6' }}>
            Noch keine Immobilien hinzugefügt
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {properties.map(property => {
              const cashflow = calculatePropertyCashflow(property);
              const grossYield = (property.monthlyRent * 12 / property.currentValue * 100).toFixed(1);
              const netYield = (cashflow.netMonthlyCashflow * 12 / property.currentValue * 100).toFixed(1);
              
              return (
                <div key={property.id} className="property-card">
                  <div className="property-header">
                    <h3 className="property-name">{property.name}</h3>
                    <div className="property-actions">
                      <button 
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEditProperty(property)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn btn-small btn-danger"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="property-details">
                    <div style={{ fontSize: '12px', color: '#a1a1a6' }}>
                      <strong>Miete:</strong><br />
                      {formatters.currency(property.monthlyRent)}/Monat
                    </div>
                    <div style={{ fontSize: '12px', color: '#a1a1a6' }}>
                      <strong>Netto-Cashflow:</strong><br />
                      {formatters.currency(cashflow.netMonthlyCashflow)}/Monat
                    </div>
                    <div style={{ fontSize: '12px', color: '#a1a1a6' }}>
                      <strong>Wert:</strong><br />
                      {formatters.currency(property.currentValue)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#a1a1a6' }}>
                      <strong>Rendite:</strong><br />
                      {grossYield}% brutto | {netYield}% netto
                    </div>
                    <div style={{ fontSize: '12px', color: '#a1a1a6' }}>
                      <strong>Leerstand:</strong><br />
                      {property.vacancyRate}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#a1a1a6' }}>
                      <strong>Instandhaltung:</strong><br />
                      {formatters.currency(property.annualMaintenance)}/Jahr
                    </div>
                    {property.afaActive && (
                      <div style={{ fontSize: '12px', color: '#a1a1a6' }}>
                        <strong>AfA:</strong><br />
                        {property.afaRate}% ({property.afaRemainingYears} Jahre)
                      </div>
                    )}
                  </div>

                  {property.plannedSale && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '6px', 
                      background: 'rgba(255, 149, 0, 0.1)', 
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#FF9500'
                    }}>
                      📅 Geplanter Verkauf {property.plannedSale.year}: {formatters.currency(property.plannedSale.salePrice)}
                    </div>
                  )}

                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                    <button 
                      className={`btn btn-small ${property.plannedSale ? 'btn-secondary' : 'btn'}`}
                      onClick={() => togglePlannedSale(property)}
                      style={{ fontSize: '11px' }}
                    >
                      {property.plannedSale ? '❌ Verkauf stornieren' : '📅 Verkauf planen'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ImmobilienManager;
