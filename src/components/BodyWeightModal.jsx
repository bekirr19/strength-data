import React, { useState, useEffect, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis, ReferenceLine } from 'recharts';
import { getBodyWeightCollection } from '../utils/storage-client';
import { formatDateLongEN } from '../utils/datetime';
import { Modal } from '../ds/components/feedback/Modal';
import { Button } from '../ds/components/buttons/Button';
import { SegmentedControl } from '../ds/components/forms/SegmentedControl';

export default function BodyWeightModal({ isOpen, onClose, initialWeight, onSave, selectedDate }) {
  const [weight, setWeight] = useState(initialWeight || '');
  const [history, setHistory] = useState({});
  const [timeRange, setTimeRange] = useState('monthly');
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
      console.error('Could not load body weight history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const rawEntries = Object.entries(history)
      .map(([iso, val]) => ({ date: iso, value: Number(val), timestamp: new Date(iso).getTime() }))
      .filter((item) => !isNaN(item.value) && item.value > 0)
      .sort((a, b) => a.timestamp - b.timestamp);
    if (rawEntries.length === 0) return [];
    const now = new Date();
    let cutoffDate = new Date(0);
    if (timeRange === 'weekly') { cutoffDate = new Date(now); cutoffDate.setDate(now.getDate() - 7); }
    else if (timeRange === 'monthly') { cutoffDate = new Date(now); cutoffDate.setMonth(now.getMonth() - 1); }
    else if (timeRange === 'yearly') { cutoffDate = new Date(now); cutoffDate.setFullYear(now.getFullYear() - 1); }
    return rawEntries.filter((item) => item.timestamp >= cutoffDate.getTime());
  }, [history, timeRange]);

  const { minValue, maxValue } = useMemo(() => {
    if (!chartData || chartData.length === 0) return { minValue: 0, maxValue: 0 };
    const values = chartData.map((d) => d.value).filter((v) => Number.isFinite(v));
    if (values.length === 0) return { minValue: 0, maxValue: 0 };
    return { minValue: Math.min(...values), maxValue: Math.max(...values) };
  }, [chartData]);

  const handleSave = () => { onSave(weight); onClose(); };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      variant="dialog"
      contained={false}
      maxWidth={460}
      eyebrow="Body weight"
      title={formatDateLongEN(selectedDate)}
      footer={<Button variant="primary" fullWidth size="lg" onClick={handleSave}>Save</Button>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 4 }}>
        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, padding: '12px 0' }}>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0.0"
            autoFocus
            onFocus={(e) => e.target.select()}
            style={{ width: 160, border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.02em' }}
          />
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-tertiary)' }}>kg</span>
        </div>

        {/* History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span className="sd-eyebrow">History</span>
            <SegmentedControl
              size="sm"
              fill={false}
              options={[{ value: 'weekly', label: '1W' }, { value: 'monthly', label: '1M' }, { value: 'yearly', label: '1Y' }, { value: 'all', label: 'All' }]}
              value={timeRange}
              onChange={setTimeRange}
            />
          </div>

          <div style={{ height: 220, width: '100%', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: 12, position: 'relative' }}>
            {isLoading ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent)', animation: 'sd-spin 0.8s linear infinite' }} />
                <style>{`@keyframes sd-spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[minValue, maxValue + 0.5]} stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 10 }} width={40} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: 10, borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}>
                            <p style={{ margin: 0, fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>{formatDateLongEN(payload[0].payload.date)}</p>
                            <p style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)' }} className="sd-tnum">{payload[0].value} <span style={{ fontSize: 'var(--text-xs)', fontWeight: 400, color: 'var(--text-tertiary)' }}>kg</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {maxValue > 0 && <ReferenceLine y={maxValue} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: `${maxValue} kg`, position: 'left', fill: '#2563eb', fontSize: 10, textAnchor: 'end' }} />}
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>No data</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
