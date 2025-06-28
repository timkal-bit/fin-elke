import React, { useState } from 'react';
import { Plus, Trash2, Edit, Calendar, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

const EinmaligeAusgaben = ({ oneTimeExpenses, onUpdateExpense, onAddExpense, onRemoveExpense }) => {
    const [editingExpense, setEditingExpense] = useState(null);

    const handleExpenseUpdate = (expenseId, field, value) => {
        onUpdateExpense(expenseId, field, value);
    };

    const monthNames = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear + i);

    // Sortiere Ausgaben nach Jahr und Monat
    const sortedExpenses = [...oneTimeExpenses].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    // Gruppiere nach Jahren
    const expensesByYear = sortedExpenses.reduce((acc, expense) => {
        if (!acc[expense.year]) acc[expense.year] = [];
        acc[expense.year].push(expense);
        return acc;
    }, {});

    const totalExpenses = oneTimeExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2 text-purple-500" />
                        Einmalige Ausgaben
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Gesamtvolumen: <span className="font-semibold">{formatCurrency(totalExpenses)}</span>
                    </p>
                </div>
                <button
                    onClick={onAddExpense}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Ausgabe hinzufügen</span>
                </button>
            </div>

            {oneTimeExpenses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Keine einmaligen Ausgaben geplant</h3>
                    <p className="text-gray-600 mb-4">Fügen Sie geplante Anschaffungen oder besondere Ausgaben hinzu</p>
                    <button
                        onClick={onAddExpense}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
                    >
                        Erste Ausgabe hinzufügen
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(expensesByYear).map(([year, expenses]) => (
                        <div key={year} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center mb-4">
                                <Calendar className="w-5 h-5 text-purple-500 mr-2" />
                                <h4 className="text-lg font-semibold text-gray-900">{year}</h4>
                                <div className="ml-auto text-sm text-gray-600">
                                    {expenses.length} Ausgabe{expenses.length !== 1 ? 'n' : ''} • {formatCurrency(expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {expenses.map((expense) => (
                                    <div key={expense.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                            {/* Name */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                                {editingExpense === expense.id ? (
                                                    <input
                                                        type="text"
                                                        value={expense.name}
                                                        onChange={(e) => handleExpenseUpdate(expense.id, 'name', e.target.value)}
                                                        onBlur={() => setEditingExpense(null)}
                                                        onKeyDown={(e) => e.key === 'Enter' && setEditingExpense(null)}
                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div 
                                                        className="text-sm font-medium text-gray-900 cursor-pointer hover:text-purple-600"
                                                        onClick={() => setEditingExpense(expense.id)}
                                                    >
                                                        {expense.name}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Betrag */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Betrag</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={expense.amount}
                                                        onChange={(e) => handleExpenseUpdate(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        placeholder="0"
                                                    />
                                                    <span className="absolute right-2 top-1 text-xs text-gray-500">€</span>
                                                </div>
                                            </div>

                                            {/* Monat */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Monat</label>
                                                <select
                                                    value={expense.month}
                                                    onChange={(e) => handleExpenseUpdate(expense.id, 'month', parseInt(e.target.value))}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    {monthNames.map((month, index) => (
                                                        <option key={index} value={index + 1}>{month}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Jahr */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Jahr</label>
                                                <select
                                                    value={expense.year}
                                                    onChange={(e) => handleExpenseUpdate(expense.id, 'year', parseInt(e.target.value))}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    {years.map(year => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setEditingExpense(editingExpense === expense.id ? null : expense.id)}
                                                className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onRemoveExpense(expense.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Schnellzugriff für häufige Ausgaben */}
            {oneTimeExpenses.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-medium text-blue-900 mb-3">Schnellzugriff - Häufige Ausgaben</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            { name: 'Neues Auto', amount: 25000 },
                            { name: 'Küche', amount: 15000 },
                            { name: 'Urlaub', amount: 3000 },
                            { name: 'Renovierung', amount: 20000 },
                            { name: 'Möbel', amount: 5000 },
                            { name: 'Elektronik', amount: 2000 },
                            { name: 'Medizinische Behandlung', amount: 8000 },
                            { name: 'Sonstiges', amount: 1000 }
                        ].map((template, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    const newExpense = {
                                        id: Date.now() + index,
                                        name: template.name,
                                        amount: template.amount,
                                        year: currentYear + 1,
                                        month: 1
                                    };
                                    onAddExpense(newExpense);
                                }}
                                className="p-2 text-xs bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                            >
                                <div className="font-medium text-blue-900">{template.name}</div>
                                <div className="text-blue-600">{formatCurrency(template.amount)}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EinmaligeAusgaben;
