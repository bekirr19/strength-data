import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Trophy, Calendar, Dumbbell, Activity, TrendingUp, BarChart2, PieChart as PieChartIcon, List } from 'lucide-react';
import { getWorkouts } from '../utils/storage';
import { getExerciseInfo } from '../utils/exerciseMetadata';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

export default function Wrapped2025Modal({ isOpen, onClose }) {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('story'); // 'story' | 'report'
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setViewMode('story');
      setCurrentSlide(0);
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allWorkouts = await getWorkouts();
      const workouts2025 = Object.values(allWorkouts).filter(w => w.dateISO && w.dateISO.startsWith('2025'));
      
      if (workouts2025.length === 0) {
        setSlides([{ 
          type: 'no-data',
          title: 'Henüz Veri Yok',
          subtitle: '2025 yılında henüz antrenman kaydın bulunmuyor.',
          icon: <Activity size={64} className="text-gray-400" />
        }]);
        setLoading(false);
        return;
      }

      // --- Story Stats Calculation ---
      const totalWorkouts = workouts2025.length;
      let totalSets = 0;
      let totalReps = 0;
      let totalVolume = 0;
      const exerciseCounts = {};
      let maxWeight = 0;
      let maxWeightExercise = '';
      const monthlyCounts = {};
      const monthlyVolume = {};
      const categoryCounts = { push: 0, pull: 0, leg: 0, other: 0 };

      workouts2025.forEach(w => {
        const month = w.dateISO.substring(0, 7); // YYYY-MM
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
        
        let workoutVolume = 0;

        if (w.items) {
          w.items.forEach(item => {
            const name = item.canonicalName || item.name;
            exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
            
            // Category detection
            const info = getExerciseInfo(name, item);
            const cat = info.category || 'other';
            if (categoryCounts[cat] !== undefined) {
              categoryCounts[cat]++;
            } else {
              categoryCounts.other++;
            }

            if (item.sets) {
              item.sets.forEach(s => {
                totalSets++;
                const r = Number(s.r) || 0;
                const w = Number(s.w) || 0;
                totalReps += r;
                const vol = r * w;
                totalVolume += vol;
                workoutVolume += vol;

                if (w > maxWeight) {
                  maxWeight = w;
                  maxWeightExercise = name;
                }
              });
            }
          });
        }
        monthlyVolume[month] = (monthlyVolume[month] || 0) + workoutVolume;
      });

      const sortedExercises = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1]);
      const topExercise = sortedExercises[0];
      
      const sortedMonths = Object.entries(monthlyCounts).sort((a, b) => b[1] - a[1]);
      const bestMonth = sortedMonths[0];
      const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
      const bestMonthName = bestMonth ? monthNames[parseInt(bestMonth[0].split('-')[1]) - 1] : '';

      // --- Report Data Preparation ---
      const monthlyStats = [];
      for (let i = 1; i <= 12; i++) {
        const monthKey = `2025-${String(i).padStart(2, '0')}`;
        monthlyStats.push({
          name: monthNames[i-1].substring(0, 3),
          fullMonth: monthNames[i-1],
          count: monthlyCounts[monthKey] || 0,
          volume: Math.round((monthlyVolume[monthKey] || 0) / 1000) // in tons/kilos simplified
        });
      }

      const categoryData = [
        { name: 'Push', value: categoryCounts.push, color: '#f97316' }, // Orange
        { name: 'Pull', value: categoryCounts.pull, color: '#0ea5e9' }, // Sky
        { name: 'Leg', value: categoryCounts.leg, color: '#84cc16' },  // Lime
        { name: 'Diğer', value: categoryCounts.other, color: '#6b7280' } // Gray
      ].filter(c => c.value > 0);

      const topExercisesList = sortedExercises.slice(0, 5).map(([name, count]) => ({
        name,
        count,
        info: getExerciseInfo(name)
      }));

      setReportData({
        monthlyStats,
        categoryData,
        topExercisesList,
        totalWorkouts,
        totalVolume,
        totalSets
      });

      const generatedSlides = [
        {
          type: 'intro',
          title: '2025 Özeti',
          subtitle: 'Senin Yılın, Senin Gücün',
          icon: <Activity size={64} className="text-yellow-400" />,
          gradient: 'from-purple-600 to-blue-600'
        },
        {
          type: 'stat',
          title: 'Toplam Antrenman',
          value: totalWorkouts,
          subtitle: 'Kez salona gittin!',
          icon: <Calendar size={48} className="text-blue-400" />,
          gradient: 'from-blue-600 to-cyan-500'
        },
        {
          type: 'stat',
          title: 'Toplam Set',
          value: totalSets,
          subtitle: `${totalReps.toLocaleString()} tekrar attın!`,
          icon: <Dumbbell size={48} className="text-green-400" />,
          gradient: 'from-emerald-600 to-green-500'
        },
        {
          type: 'highlight',
          title: 'Favori Egzersizin',
          value: topExercise ? topExercise[0] : '-',
          subtitle: `${topExercise ? topExercise[1] : 0} kez yaptın`,
          icon: <Trophy size={48} className="text-purple-400" />,
          gradient: 'from-indigo-600 to-purple-500'
        },
        {
          type: 'highlight',
          title: 'En Ağır Kaldırışın',
          value: `${maxWeight} kg`,
          subtitle: maxWeightExercise,
          icon: <TrendingUp size={48} className="text-red-400" />,
          gradient: 'from-red-600 to-orange-500'
        },
        {
          type: 'highlight',
          title: 'En Aktif Ayın',
          value: bestMonthName,
          subtitle: `${bestMonth ? bestMonth[1] : 0} antrenman`,
          icon: <Calendar size={48} className="text-orange-400" />,
          gradient: 'from-orange-600 to-yellow-500'
        },
        {
          type: 'outro',
          title: 'Harika İş!',
          subtitle: '2026\'da daha da güçlü ol!',
          icon: <Trophy size={64} className="text-yellow-400" />,
          gradient: 'from-pink-600 to-rose-500',
          hasAction: true
        }
      ];

      setSlides(generatedSlides);
    } catch (error) {
      console.error("Error generating wrapped:", error);
      setSlides([{ type: 'error', title: 'Hata', subtitle: 'Veriler yüklenemedi.' }]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(curr => curr + 1);
    } else {
      // Story bittiğinde kapatmak yerine rapora yönlendirebiliriz veya kapatabiliriz.
      // Şimdilik kapatalım, kullanıcı butona basarsa rapora gider.
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(curr => curr - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-0 md:p-4">
      <div className={`relative w-full h-full md:h-auto md:max-w-md md:aspect-[9/16] bg-gradient-to-br ${viewMode === 'story' ? (slides[currentSlide]?.gradient || 'from-gray-900 to-black') : 'from-gray-900 to-black'} md:rounded-3xl overflow-hidden border-0 md:border border-white/10 shadow-2xl transition-colors duration-500 flex flex-col`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/80 hover:text-white transition"
        >
          <X size={24} />
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-full text-white">
            <LoadingSpinner />
          </div>
        ) : viewMode === 'story' ? (
          // --- STORY MODE ---
          <div className="h-full w-full relative" onClick={nextSlide}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                transition={{ duration: 0.4 }}
                className="h-full w-full flex flex-col items-center justify-center p-8 text-center select-none cursor-pointer"
              >
                {slides[currentSlide] && (
                  <>
                    <div className="mb-8 p-6 bg-white/10 rounded-full backdrop-blur-md shadow-lg">
                      {slides[currentSlide].icon}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                      {slides[currentSlide].title}
                    </h2>
                    <div className="text-5xl font-black text-white mb-4 drop-shadow-lg">
                      {slides[currentSlide].value}
                    </div>
                    <p className="text-xl text-white/90 font-medium drop-shadow-md mb-8">
                      {slides[currentSlide].subtitle}
                    </p>

                    {slides[currentSlide].hasAction && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewMode('report');
                        }}
                        className="mt-4 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition shadow-xl animate-bounce"
                      >
                        Detaylı Raporu İncele
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full flex gap-1 p-2 z-10">
              {slides.map((_, idx) => (
                <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: idx < currentSlide ? "100%" : idx === currentSlide ? "100%" : "0%" }}
                    transition={{ duration: idx === currentSlide ? 5 : 0 }}
                    onAnimationComplete={() => {
                      if (idx === currentSlide) nextSlide();
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Hints */}
            <div className="absolute bottom-8 left-0 w-full flex justify-between px-8 text-white/20">
              <ChevronLeft size={32} onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="hover:text-white/60 transition cursor-pointer" />
              <ChevronRight size={32} className="hover:text-white/60 transition" />
            </div>
          </div>
        ) : (
          // --- REPORT MODE ---
          <div className="h-full w-full bg-[#121212] text-white overflow-y-auto overflow-x-hidden scrollbar-hide">
            <div className="p-6 pb-24 space-y-8">
              <div className="flex items-center justify-between mb-6 mt-8">
                <div>
                  <h2 className="text-2xl font-bold">2025 Raporu</h2>
                  <p className="text-gray-400 text-sm">Detaylı gelişim analizi</p>
                </div>
                <button 
                  onClick={() => setViewMode('story')}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              {/* Monthly Activity Chart */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-400" />
                  Aylık Antrenman Sayısı
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData?.monthlyStats}>
                      <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Volume Progress Chart */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-400" />
                  Hacim İlerlemesi (Ton)
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData?.monthlyStats}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="volume" stroke="#10b981" fillOpacity={1} fill="url(#colorVolume)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <PieChartIcon size={20} className="text-purple-400" />
                  Kategori Dağılımı
                </h3>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData?.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {reportData?.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                         itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                  {reportData?.categoryData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs text-gray-300">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Exercises */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <List size={20} className="text-orange-400" />
                  En Çok Yapılanlar
                </h3>
                <div className="space-y-3">
                  {reportData?.topExercisesList.map((ex, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-sm font-bold text-white">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium text-white">{ex.name}</div>
                          <div className="text-xs text-gray-400">{ex.info.categoryMeta.label}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{ex.count}</div>
                        <div className="text-xs text-gray-500">kez</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setViewMode('story')}
                  className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition"
                >
                  Özete Dön
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  );
}
