import React, { useState, useEffect, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { getBodyWeightCollection, formatDateTRFull, fromISO } from '../utils/storage';

export default function BodyWeightModal({ isOpen, onClose, initialWeight, onSave, selectedDate }) {
  const [weight, setWeight] = useState(initialWeight || '');
  const [history, setHistory] = useState({});
  const [timeRange, setTimeRange] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly' | 'all'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setWeight(initialWeight || '');
      loadHistory();
    }
  }, [isOpen, initialWeight]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await getBodyWeightCollection();
      setHistory(data || {});
    } catch (error) {
      console.error('Vücut ağırlığı geçmişi yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const entries = Object.entries(history)
      .map(([iso, val]) => ({
        date: iso,
        value: Number(val),
        timestamp: new Date(iso).getTime()
      }))
      .filter(item => !isNaN(item.value) && item.value > 0)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (entries.length === 0) return [];

    const now = new Date();
    let cutoffDate = new Date(0); // Default 'all'

    if (timeRange === 'weekly') {
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'monthly') {
      cutoffDate = new Date(now);
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'yearly') {
      cutoffDate = new Date(now);
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }

    return entries.filter(item => item.timestamp >= cutoffDate.getTime());
  }, [history, timeRange]);

  const handleSave = () => {
    onSave(weight);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#1C1C1E] border border-white/10 rounded-3xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h3 className="text-white text-lg font-bold uppercase tracking-wide">Vücut Ağırlığı</h3>
            <p className="text-gray-400 text-xs">{formatDateTRFull(selectedDate)}</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-8 rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Input Section */}
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <div className="relative group">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
                className="w-40 bg-transparent text-center text-5xl font-black text-white focus:outline-none placeholder:text-white/10"
                autoFocus
              />
              <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">kg</span>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/10 group-focus-within:bg-primary transition-colors"></div>
            </div>
            
            <button
              onClick={handleSave}
              className="w-full max-w-xs rounded-xl bg-primary py-3 text-sm font-bold text-background-dark hover:bg-primary/90 transition shadow-lg shadow-primary/20"
            >
              Kaydet
            </button>
          </div>

          {/* Chart Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider">Geçmiş</h4>
              <div className="flex bg-white/5 rounded-lg p-1">
                {['weekly', 'monthly', 'yearly', 'all'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                      timeRange === range 
                        ? 'bg-white/10 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {range === 'weekly' ? '1H' : range === 'monthly' ? '1A' : range === 'yearly' ? '1Y' : 'Tümü'}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full bg-black/20 rounded-2xl border border-white/5 p-4 relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0DF293" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0DF293" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#ffffff20"
                      tick={{ fill: '#ffffff60', fontSize: 10 }}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `${d.getDate()}.${d.getMonth() + 1}`;
                      }}
                      tickMargin={10}
                    />
                    <YAxis 
                      domain={['dataMin - 1', 'dataMax + 1']} 
                      stroke="#ffffff20"
                      tick={{ fill: '#ffffff60', fontSize: 10 }}
                      width={30}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#1C1C1E] border border-white/10 p-3 rounded-xl shadow-xl">
                              <p className="text-xs text-gray-400 mb-1">{formatDateTRFull(payload[0].payload.date)}</p>
                              <p className="text-lg font-bold text-white">
                                {payload[0].value} <span className="text-xs font-normal text-gray-500">kg</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0DF293"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorWeight)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
                  Veri yok
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
