'use client';
import React, { useState, useEffect } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, DevicePerformance, Campaign } from '../../src/types/marketing';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function DeviceView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const devicePerformance: DevicePerformance[] = marketingData?.campaigns.device_performance || [];

  const summaryCardData = [
    { label: 'Mobile', color: 'bg-sky-700', device: 'Mobile' },
    { label: 'Desktop', color: 'bg-yellow-700', device: 'Desktop' },
    { label: 'Tablet', color: 'bg-purple-700', device: 'Tablet' },
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Header */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12 shadow-lg">
          <div className="px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-lg">
              Device Performance Overview
            </h1>
          </div>
        </section>

        {/* Summary Cards */}
        <div className="flex flex-col md:flex-row gap-6 px-6 py-8 justify-center">
          {summaryCardData.map(({ label, color, device }) => {
            const data = devicePerformance.find(d => d.device === device);
            return (
              <div key={device} className={`flex-1 rounded-xl shadow-lg ${color} p-6 text-white`}>
                <h3 className="text-lg font-semibold mb-2">{label}</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div><span className="font-bold">Impressions:</span> {data?.impressions.toLocaleString() ?? '-'}</div>
                  <div><span className="font-bold">Clicks:</span> {data?.clicks.toLocaleString() ?? '-'}</div>
                  <div><span className="font-bold">Conversions:</span> {data?.conversions ?? '-'}</div>
                  <div><span className="font-bold">Spend:</span> ${data?.spend.toLocaleString() ?? '-'}</div>
                  <div><span className="font-bold">Revenue:</span> ${data?.revenue.toLocaleString() ?? '-'}</div>
                  <div><span className="font-bold">CTR:</span> {data?.ctr ?? '-'}%</div>
                  <div><span className="font-bold">Conversion Rate:</span> {data?.conversion_rate ?? '-'}%</div>
                  <div><span className="font-bold">Traffic %:</span> {data?.percentage_of_traffic ?? '-'}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-8">
          {summaryCardData.map(({ label, device }) => {
            const data = devicePerformance.filter(d => d.device === device);
            const colors = device === 'Mobile' ? ['#38bdf8', '#0ea5e9', '#0369a1'] :
                          device === 'Desktop' ? ['#fbbf24', '#f59e42', '#b45309'] :
                          ['#a78bfa', '#c4b5fd', '#7c3aed'];
            return (
              <div key={device} className="bg-gray-800 rounded-lg p-6 flex-1 shadow-lg">
                <h2 className={`text-xl font-semibold mb-4 text-center ${
                  device === 'Mobile' ? 'text-sky-300' : device === 'Desktop' ? 'text-yellow-300' : 'text-purple-300'
                }`}>
                  {label} Device Performance
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="impressions" fill={colors[0]} name="Impressions" />
                    <Bar dataKey="clicks" fill={colors[1]} name="Clicks" />
                    <Bar dataKey="conversions" fill={colors[2]} name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </main>
        <Footer />
      </div>
    </div>
  );
}
