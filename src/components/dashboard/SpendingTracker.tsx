
import { useState, useRef, useEffect } from 'react';
import { CreditCard, Plus, BarChart, Trash2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useLocalStorage from '@/hooks/useLocalStorage';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const categories = [
  'Food', 'Transportation', 'Shopping', 'Entertainment', 
  'Education', 'Bills', 'Health', 'Other'
];

const categoryColors: Record<string, string> = {
  'Food': '#FF6384',
  'Transportation': '#36A2EB',
  'Shopping': '#FFCE56',
  'Entertainment': '#4BC0C0',
  'Education': '#9966FF',
  'Bills': '#FF9F40',
  'Health': '#C9CBCF',
  'Other': '#7F8487'
};

const SpendingTracker = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<any>(null);
  
  const handleAddExpense = () => {
    if (!amount || parseFloat(amount) <= 0 || !description.trim()) return;
    
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      date: new Date().toISOString(),
    };
    
    setExpenses([...expenses, newExpense]);
    resetForm();
  };
  
  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };
  
  const resetForm = () => {
    setAmount('');
    setCategory(categories[0]);
    setDescription('');
  };
  
  const getFilteredExpenses = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of period based on active tab
    let startDate = new Date();
    if (activeTab === 'day') {
      startDate = today;
    } else if (activeTab === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
    } else if (activeTab === 'month') {
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
    } else if (activeTab === 'year') {
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
    }
    
    return expenses.filter(expense => new Date(expense.date) >= startDate);
  };
  
  // Calculate total for the filtered expenses
  const filteredExpenses = getFilteredExpenses();
  const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Group expenses by category for the chart
  const getCategoryTotals = () => {
    const totals: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      if (!totals[expense.category]) {
        totals[expense.category] = 0;
      }
      totals[expense.category] += expense.amount;
    });
    
    return totals;
  };
  
  // Handle chart rendering
  useEffect(() => {
    const loadChart = async () => {
      if (!chartRef.current) return;
      
      try {
        // Dynamically import Chart.js to avoid server-side rendering issues
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);
        
        // Destroy previous chart if it exists
        if (chartInstance) {
          chartInstance.destroy();
        }
        
        const categoryTotals = getCategoryTotals();
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        const backgroundColors = labels.map(label => categoryColors[label] || '#7F8487');
        
        // Create new chart
        const newChartInstance = new Chart(chartRef.current, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [
              {
                data,
                backgroundColor: backgroundColors,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  padding: 20,
                  boxWidth: 12,
                  boxHeight: 12,
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number;
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `$${value.toFixed(2)} (${percentage}%)`;
                  },
                },
              },
            },
          },
        });
        
        setChartInstance(newChartInstance);
      } catch (error) {
        console.error('Error loading Chart.js:', error);
      }
    };
    
    loadChart();
    
    // Cleanup
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [filteredExpenses, activeTab]);
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Create chart URL
    let chartUrl = '';
    if (chartRef.current) {
      chartUrl = chartRef.current.toDataURL();
    }
    
    // Format the date range for the title
    let dateRangeText = '';
    const now = new Date();
    if (activeTab === 'day') {
      dateRangeText = `for ${now.toLocaleDateString()}`;
    } else if (activeTab === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      dateRangeText = `from ${weekAgo.toLocaleDateString()} to ${now.toLocaleDateString()}`;
    } else if (activeTab === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      dateRangeText = `from ${monthAgo.toLocaleDateString()} to ${now.toLocaleDateString()}`;
    } else if (activeTab === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(now.getFullYear() - 1);
      dateRangeText = `from ${yearAgo.toLocaleDateString()} to ${now.toLocaleDateString()}`;
    }
    
    // Create content for print window
    printWindow.document.write(`
      <html>
        <head>
          <title>Spending Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .chart-container { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .summary { margin-top: 30px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Spending Report</h1>
            <p>${dateRangeText}</p>
          </div>
          
          ${chartUrl ? `
            <div class="chart-container">
              <img src="${chartUrl}" alt="Expense Chart" style="max-width: 500px; height: auto;" />
            </div>
          ` : ''}
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filteredExpenses.map(expense => `
                <tr>
                  <td>${new Date(expense.date).toLocaleDateString()}</td>
                  <td>${expense.description}</td>
                  <td>${expense.category}</td>
                  <td>$${expense.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Expenses:</strong> $${total.toFixed(2)}</p>
            ${Object.entries(getCategoryTotals()).map(([category, amount]) => `
              <p><strong>${category}:</strong> $${amount.toFixed(2)} (${((amount / total) * 100).toFixed(1)}%)</p>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Aravind Dashboard - Expense Tracker</p>
          </div>
          
          <button onclick="window.print();" style="margin-top: 20px; padding: 10px 20px;">Print Report</button>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Automatically trigger print dialog
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1000);
  };
  
  return (
    <div className="dash-card">
      <div className="dash-card-title">
        <CreditCard className="h-5 w-5" />
        <span>Spending Tracker</span>
      </div>
      
      <div className="mb-4">
        <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full md:w-1/4"
            />
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-1/4">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full md:w-2/4"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleAddExpense}
              disabled={!amount || parseFloat(amount) <= 0 || !description.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs 
        defaultValue="week" 
        onValueChange={(value) => setActiveTab(value as any)}
        className="mb-4"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <TabsList>
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
          
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handlePrint}
            disabled={filteredExpenses.length === 0}
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print Report</span>
          </Button>
        </div>
        
        <div className="my-4 p-3 bg-secondary/30 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
              <p className="text-2xl font-semibold">${total.toFixed(2)}</p>
            </div>
            
            <div className="text-right">
              <h3 className="text-sm font-medium text-muted-foreground">Time Period</h3>
              <p className="text-base">
                {activeTab === 'day' && 'Today'}
                {activeTab === 'week' && 'Last 7 days'}
                {activeTab === 'month' && 'Last 30 days'}
                {activeTab === 'year' && 'Last 365 days'}
              </p>
            </div>
          </div>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No expenses recorded for this period.</p>
            <p className="text-sm">Add some expenses to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <canvas ref={chartRef} />
            </div>
            
            <div className="h-80 overflow-auto">
              <div className="space-y-2">
                {filteredExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(expense => (
                    <div 
                      key={expense.id}
                      className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0 mr-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: categoryColors[expense.category] || '#7F8487' }}
                          />
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-medium truncate">{expense.description}</h3>
                          <div className="text-sm text-muted-foreground flex gap-2">
                            <span>{expense.category}</span>
                            <span>•</span>
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 items-center">
                        <span className="font-medium">${expense.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default SpendingTracker;
