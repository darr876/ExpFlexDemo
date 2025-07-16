import React, { useState, useCallback } from 'react';
import { Copy, Plus, Trash2, Save, Upload, RotateCcw } from 'lucide-react';

const ExpenseReportApp = () => {
  const [purpose, setPurpose] = useState('');
  const [globalProject, setGlobalProject] = useState('');
  const [globalTask, setGlobalTask] = useState('');
  const [expenseLines, setExpenseLines] = useState([]);
  const [output, setOutput] = useState('');
  const [savedDraft, setSavedDraft] = useState(null);
  const [showOutput, setShowOutput] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [year, month, day] = dateString.split("-");
    return `${parseInt(day)}-${months[parseInt(month) - 1]}-${year}`;
  };

  const addExpenseLine = useCallback(() => {
    const newLine = {
      id: Date.now(),
      startDate: '',
      days: 1,
      amount: '',
      project: globalProject,
      task: globalTask,
      justification: '',
      additionalInfo: ''
    };
    setExpenseLines(prev => [...prev, newLine]);
  }, [globalProject, globalTask]);

  const updateExpenseLine = (id, field, value) => {
    setExpenseLines(prev => 
      prev.map(line => 
        line.id === id ? { ...line, [field]: value } : line
      )
    );
  };

  const deleteExpenseLine = (id) => {
    setExpenseLines(prev => prev.filter(line => line.id !== id));
  };

  const calculateTotal = () => {
    return expenseLines.reduce((total, line) => {
      return total + (parseFloat(line.amount) || 0);
    }, 0);
  };

  const generateOutput = async () => {
    const costCenter = "10241";
    const currency = "USD";
    const template = "SITA US INC TEMPLATE";
    const approver = "";
    
    const total = calculateTotal();
    const lines = expenseLines.map((line, index) => {
      const amount = parseFloat(line.amount) || 0;
      return `${index + 1}\t${formatDate(line.startDate)}\t${line.days || ''}\t\t${amount.toFixed(2)}\t${currency}\t1.\t${amount.toFixed(2)}\tMeals\t${line.project || ''}\t${line.task || ''}\t\t${line.justification || ''}\t${line.additionalInfo || ''}`;
    });

    const header = `\t\t\t\tExpense Report\n\t\tExpense Cost Center\t${costCenter}\n\t\tReimbursement Currency\t${currency}\n\t\tPurpose\t${purpose}\n\t\tExpense Template\t${template}\n\t\tApprover\t${approver}\n\t\tTotal\t\t\t\t${total.toFixed(2)}\nLine\tStart Date\tDays\tDaily Rate\tReceipt Amount\tReceipt Currency\tExchange Rate\tReimbursable Amount\tExpense Type\tProject Number\tTask Number\tReceipt Missing\tJustification\tAdditional Information`;

    const body = lines.join('\n');
    const footer = `\n\t\t\t\tTotal\t${total.toFixed(2)}`;

    const result = `${header}\n${body}${footer}`;
    setOutput(result);
    setShowOutput(true);

    try {
      await navigator.clipboard.writeText(result);
    } catch (err) {
      console.log('Clipboard write failed, but output is generated');
    }
  };

  const resetForm = () => {
    setPurpose('');
    setGlobalProject('');
    setGlobalTask('');
    setExpenseLines([]);
    setOutput('');
    setShowOutput(false);
  };

  const saveDraft = () => {
    const draft = {
      purpose,
      globalProject,
      globalTask,
      expenseLines: expenseLines.map(line => ({
        startDate: line.startDate,
        days: line.days,
        amount: line.amount,
        project: line.project,
        task: line.task,
        justification: line.justification,
        additionalInfo: line.additionalInfo
      }))
    };
    setSavedDraft(draft);
  };

  const loadDraft = () => {
    if (!savedDraft) return;
    
    setPurpose(savedDraft.purpose || '');
    setGlobalProject(savedDraft.globalProject || '');
    setGlobalTask(savedDraft.globalTask || '');
    
    const restoredLines = savedDraft.expenseLines.map(line => ({
      ...line,
      id: Date.now() + Math.random()
    }));
    setExpenseLines(restoredLines);
  };

  const clearDraft = () => {
    setSavedDraft(null);
  };

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Expense Report</h1>
            <p className="text-sm text-gray-600 mt-1">Create and submit your expense report</p>
          </div>
          
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
                placeholder="Enter the purpose of your expenses..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project #</label>
                <input
                  type="text"
                  value={globalProject}
                  onChange={(e) => setGlobalProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project number..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task #</label>
                <input
                  type="text"
                  value={globalTask}
                  onChange={(e) => setGlobalTask(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task number..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expense Lines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Expense Lines</h2>
              <p className="text-sm text-gray-600">Total: ${total.toFixed(2)}</p>
            </div>
            <button
              onClick={addExpenseLine}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Line
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Justification</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Additional Info</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenseLines.map((line, index) => (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={line.startDate}
                        onChange={(e) => updateExpenseLine(line.id, 'startDate', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <input
                        type="number"
                        value={line.days}
                        onChange={(e) => updateExpenseLine(line.id, 'days', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={line.amount}
                        onChange={(e) => updateExpenseLine(line.id, 'amount', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">Meals</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <input
                        type="text"
                        value={line.project}
                        onChange={(e) => updateExpenseLine(line.id, 'project', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Project #"
                      />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <input
                        type="text"
                        value={line.task}
                        onChange={(e) => updateExpenseLine(line.id, 'task', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Task #"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={line.justification}
                        onChange={(e) => updateExpenseLine(line.id, 'justification', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Justification"
                      />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <input
                        type="text"
                        value={line.additionalInfo}
                        onChange={(e) => updateExpenseLine(line.id, 'additionalInfo', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Additional info"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteExpenseLine(line.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {expenseLines.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No expense lines added yet. Click "Add Line" to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateOutput}
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Copy size={16} className="mr-2" />
                Generate & Copy
              </button>
              
              <button
                onClick={saveDraft}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={16} className="mr-2" />
                Save Draft
              </button>
              
              <button
                onClick={loadDraft}
                disabled={!savedDraft}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Upload size={16} className="mr-2" />
                Load Draft
              </button>
              
              <button
                onClick={clearDraft}
                disabled={!savedDraft}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <RotateCcw size={16} className="mr-2" />
                Clear Draft
              </button>
              
              <button
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw size={16} className="mr-2" />
                Reset Form
              </button>
            </div>
          </div>
        </div>

        {/* Output */}
        {showOutput && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Generated Output</h3>
              <p className="text-sm text-gray-600">Output has been copied to clipboard</p>
            </div>
            <div className="px-6 py-4">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono text-gray-800">
                {output}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseReportApp;