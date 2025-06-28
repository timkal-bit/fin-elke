import React, { useState } from 'react';
import { Home, Plus, Trash2, Edit, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/calculations';

const ImmobilienDetails = ({ properties, onUpdateProperty, onAddProperty, onRemoveProperty }) => {
    const [editingProperty, setEditingProperty] = useState(null);

    const handlePropertyUpdate = (propertyId, field, value) => {
        onUpdateProperty(propertyId, field, value);
    };

    const toggleAfA = (propertyId, active) => {
        const property = properties.find(p => p.id === propertyId);
        if (active && !property.afaEndYear) {
            // Setze Standard AfA-Ende auf 50 Jahre ab heute
            handlePropertyUpdate(propertyId, 'afaEndYear', new Date().getFullYear() + 50);
        }
        handlePropertyUpdate(propertyId, 'afaActive', active);
    };

    const addPlannedSale = (propertyId) => {
        const currentYear = new Date().getFullYear();
        handlePropertyUpdate(propertyId, 'plannedSale', {
            year: currentYear + 5,
            price: 0
        });
    };

    const removePlannedSale = (propertyId) => {
        handlePropertyUpdate(propertyId, 'plannedSale', null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Home className="w-5 h-5 mr-2 text-blue-500" />
                    Immobilien-Portfolio
                </h3>
                <button
                    onClick={onAddProperty}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Objekt hinzufügen</span>
                </button>
            </div>

            {properties.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Immobilien vorhanden</h3>
                    <p className="text-gray-600 mb-4">Fügen Sie Ihr erstes Immobilienobjekt hinzu</p>
                    <button
                        onClick={onAddProperty}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        Erstes Objekt hinzufügen
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {properties.map((property) => (
                        <div key={property.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Home className="w-5 h-5 text-blue-600" />
                                    </div>
                                    {editingProperty === property.id ? (
                                        <input
                                            type="text"
                                            value={property.name}
                                            onChange={(e) => handlePropertyUpdate(property.id, 'name', e.target.value)}
                                            onBlur={() => setEditingProperty(null)}
                                            onKeyDown={(e) => e.key === 'Enter' && setEditingProperty(null)}
                                            className="text-lg font-semibold bg-transparent border-b border-blue-500 focus:outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <h4 
                                            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                                            onClick={() => setEditingProperty(property.id)}
                                        >
                                            {property.name}
                                        </h4>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setEditingProperty(editingProperty === property.id ? null : property.id)}
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onRemoveProperty(property.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Monatliche Miete */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monatliche Miete
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={property.monthlyRent}
                                            onChange={(e) => handlePropertyUpdate(property.id, 'monthlyRent', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-500 text-sm">€</span>
                                    </div>
                                </div>

                                {/* Leerstand */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Leerstand (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={property.vacancy}
                                            onChange={(e) => handlePropertyUpdate(property.id, 'vacancy', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                            min="0"
                                            max="100"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                                    </div>
                                </div>

                                {/* Instandhaltung */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Instandhaltung (€/Jahr)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={property.maintenancePerYear}
                                            onChange={(e) => handlePropertyUpdate(property.id, 'maintenancePerYear', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-500 text-sm">€</span>
                                    </div>
                                </div>

                                {/* Aktueller Wert */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aktueller Wert
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={property.currentValue}
                                            onChange={(e) => handlePropertyUpdate(property.id, 'currentValue', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-500 text-sm">€</span>
                                    </div>
                                </div>

                                {/* Wertsteigerung */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Wertsteigerung (% p.a.)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={property.appreciation}
                                            onChange={(e) => handlePropertyUpdate(property.id, 'appreciation', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="2.0"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* AfA-Sektion */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h5 className="font-medium text-gray-900">Abschreibung für Abnutzung (AfA)</h5>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={property.afaActive}
                                            onChange={(e) => toggleAfA(property.id, e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">AfA aktiv</span>
                                    </label>
                                </div>

                                {property.afaActive && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                AfA-Satz (% p.a.)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={property.afaRate}
                                                    onChange={(e) => handlePropertyUpdate(property.id, 'afaRate', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="2.0"
                                                />
                                                <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                AfA-Ende (Jahr)
                                            </label>
                                            <input
                                                type="number"
                                                value={property.afaEndYear}
                                                onChange={(e) => handlePropertyUpdate(property.id, 'afaEndYear', parseInt(e.target.value) || new Date().getFullYear())}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder={new Date().getFullYear() + 50}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Geplanter Verkauf */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h5 className="font-medium text-gray-900">Geplanter Verkauf</h5>
                                    {property.plannedSale ? (
                                        <button
                                            onClick={() => removePlannedSale(property.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Verkauf entfernen
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => addPlannedSale(property.id)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Verkauf hinzufügen
                                        </button>
                                    )}
                                </div>

                                {property.plannedSale && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Verkaufsjahr
                                            </label>
                                            <input
                                                type="number"
                                                value={property.plannedSale.year}
                                                onChange={(e) => handlePropertyUpdate(property.id, 'plannedSale', {
                                                    ...property.plannedSale,
                                                    year: parseInt(e.target.value) || new Date().getFullYear()
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Verkaufspreis
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={property.plannedSale.price}
                                                    onChange={(e) => handlePropertyUpdate(property.id, 'plannedSale', {
                                                        ...property.plannedSale,
                                                        price: parseFloat(e.target.value) || 0
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-3 top-2 text-gray-500 text-sm">€</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Zusammenfassung */}
                            <div className="mt-6 pt-6 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
                                <h6 className="font-medium text-gray-900 mb-3">Objektzusammenfassung</h6>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Effektive Miete:</span>
                                        <div className="font-semibold text-green-600">
                                            {formatCurrency(property.monthlyRent * (1 - property.vacancy / 100))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Leerstandskosten:</span>
                                        <div className="font-semibold text-red-600">
                                            -{formatCurrency(property.monthlyRent * (property.vacancy / 100))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Monatl. Instandhaltung:</span>
                                        <div className="font-semibold text-orange-600">
                                            -{formatCurrency(property.maintenancePerYear / 12)}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Netto-Cashflow:</span>
                                        <div className="font-semibold text-blue-600">
                                            {formatCurrency((property.monthlyRent * (1 - property.vacancy / 100)) - (property.maintenancePerYear / 12))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImmobilienDetails;
