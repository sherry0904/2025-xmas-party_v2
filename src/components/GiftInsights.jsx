import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Package, User } from 'lucide-react';

const GiftInsights = ({ players, onClose }) => {
  // Calculate Stats
  const stats = Object.values(players).map(p => {
    // Outgoing (My gift -> Others)
    const givenScores = Object.values(p.gift_suitability || {});
    const avgGiven = givenScores.length ? givenScores.reduce((a,b)=>a+b,0) / givenScores.length : 0;

    // Incoming (Others' gifts -> Me)
    const receivedScores = [];
    Object.values(players).forEach(giver => {
      if (giver.id === p.id) return;
      if (giver.gift_suitability && giver.gift_suitability[p.id]) {
        receivedScores.push(giver.gift_suitability[p.id]);
      }
    });
    const avgReceived = receivedScores.length ? receivedScores.reduce((a,b)=>a+b,0) / receivedScores.length : 0;

    return {
      id: p.id,
      name: p.name,
      avgGiven,
      avgReceived
    };
  });

  // Sorts
  const mostVersatileGift = [...stats].sort((a, b) => b.avgGiven - a.avgGiven)[0];
  const mostNicheGift = [...stats].sort((a, b) => a.avgGiven - b.avgGiven)[0];
  const easiestToGift = [...stats].sort((a, b) => b.avgReceived - a.avgReceived)[0];
  const hardestToGift = [...stats].sort((a, b) => a.avgReceived - b.avgReceived)[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-md w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-white/50 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur z-10">
          <div>
            <h2 className="text-2xl font-serif text-christmas-accent font-bold">Gift Insights</h2>
            <p className="text-sm text-gray-500">禮物大數據分析</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Highlights Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Giver Confidence */}
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-3 text-blue-800 font-bold uppercase text-xs tracking-wider">
                <Package className="w-4 h-4" /> 送禮者信心指數
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600">最有信心</span>
                  <div className="text-right">
                    <span className="block font-serif font-bold text-blue-900">{mostVersatileGift?.name}</span>
                    <span className="text-xs text-blue-500">{mostVersatileGift?.avgGiven.toFixed(1)} stars avg</span>
                  </div>
                </div>
                <div className="w-full h-px bg-blue-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600">最沒信心</span>
                  <div className="text-right">
                    <span className="block font-serif font-bold text-blue-900">{mostNicheGift?.name}</span>
                    <span className="text-xs text-blue-500">{mostNicheGift?.avgGiven.toFixed(1)} stars avg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Receiver Compatibility */}
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-2 mb-3 text-purple-800 font-bold uppercase text-xs tracking-wider">
                <User className="w-4 h-4" /> 收禮難易度
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-600">最好送</span>
                  <div className="text-right">
                    <span className="block font-serif font-bold text-purple-900">{easiestToGift?.name}</span>
                    <span className="text-xs text-purple-500">{easiestToGift?.avgReceived.toFixed(1)} stars avg</span>
                  </div>
                </div>
                <div className="w-full h-px bg-purple-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-600">最難送</span>
                  <div className="text-right">
                    <span className="block font-serif font-bold text-purple-900">{hardestToGift?.name}</span>
                    <span className="text-xs text-purple-500">{hardestToGift?.avgReceived.toFixed(1)} stars avg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div>
            <h3 className="font-serif font-bold text-gray-700 mb-4">詳細數據</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">玩家</th>
                    <th className="px-4 py-3 text-right">送禮者信心<br/><span className="text-[10px] font-normal normal-case opacity-70">(平均給分)</span></th>
                    <th className="px-4 py-3 text-right">收禮適合度<br/><span className="text-[10px] font-normal normal-case opacity-70">(平均得分)</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-serif font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${p.avgGiven >= 4 ? 'text-green-600' : p.avgGiven <= 2 ? 'text-red-500' : 'text-gray-700'}`}>
                          {p.avgGiven.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${p.avgReceived >= 4 ? 'text-green-600' : p.avgReceived <= 2 ? 'text-red-500' : 'text-gray-700'}`}>
                          {p.avgReceived.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default GiftInsights;
