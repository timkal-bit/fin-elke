import React from 'react';

const ExpenseSankeyChart = ({ financialData }) => {
  // Berechne die monatlichen Ausgaben für das Sankey-Diagramm
  const calculateExpenseFlows = () => {
    const expenses = financialData.expenses;
    const totalMonthlyExpenses = Object.values(expenses).reduce((sum, expense) => {
      return typeof expense === 'number' ? sum + expense : sum;
    }, 0);

    // Ausgabekategorien
    const categories = [
      { name: 'Wohnen', value: expenses.housing || 0, color: '#FF6B6B' },
      { name: 'Versicherungen', value: expenses.otherInsurance || 0, color: '#4ECDC4' },
      { name: 'Lebensmittel', value: expenses.groceries || 0, color: '#45B7D1' },
      { name: 'Freizeit', value: expenses.leisure || 0, color: '#96CEB4' },
    ];

    return {
      totalMonthlyExpenses,
      categories
    };
  };

  const { totalMonthlyExpenses, categories } = calculateExpenseFlows();

  // Einfaches Balkendiagramm anstatt Sankey
  const SimpleBars = () => (
    <div className="expense-bars">
      {categories.map((cat, index) => (
        <div key={index} className="expense-bar-item">
          <div className="expense-bar-header">
            <span className="expense-bar-label">{cat.name}</span>
            <span className="expense-bar-value">
              {cat.value.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR'
              })}
            </span>
          </div>
          <div className="expense-bar-track">
            <div 
              className="expense-bar-fill" 
              style={{
                width: `${totalMonthlyExpenses > 0 ? (cat.value / totalMonthlyExpenses) * 100 : 0}%`,
                backgroundColor: cat.color
              }}
            />
          </div>
          <div className="expense-bar-percent">
            {totalMonthlyExpenses > 0 ? ((cat.value / totalMonthlyExpenses) * 100).toFixed(1) : 0}%
          </div>
        </div>
      ))}
    </div>
  );

  if (totalMonthlyExpenses === 0) {
    return (
      <div className="sankey-container">
        <div className="chart-header">
          <h2>Ausgabenverteilung</h2>
        </div>
        <div className="no-data-message">
          <p>Keine Ausgabendaten verfügbar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sankey-container">
      <div className="chart-header">
        <h2>Ausgabenverteilung (Monatlich)</h2>
        <div className="total-expenses">
          Gesamt: {totalMonthlyExpenses.toLocaleString('de-DE', {
            style: 'currency',
            currency: 'EUR'
          })} / Monat
        </div>
      </div>
      
      <div className="sankey-wrapper">
        <SimpleBars />
      </div>
    </div>
  );
};

export default ExpenseSankeyChart;
