'use client';
import React, { useState, useEffect } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, DevicePerformance, Campaign} from '../../src/types/marketing';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function DeviceView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [devicePerformance, setDevicePerformance] = useState<DevicePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
        
        // Extract and aggregate device performance data from all campaigns
        const allDeviceData: DevicePerformance[] = [];
        data.campaigns.forEach(campaign => {
          if (campaign.device_performance) {
            allDeviceData.push(...campaign.device_performance);
          }
        });
        
        // Group by device and aggregate the metrics
        const deviceMap = new Map<string, DevicePerformance>();
        allDeviceData.forEach(device => {
          if (deviceMap.has(device.device)) {
            const existing = deviceMap.get(device.device)!;
            deviceMap.set(device.device, {
              device: device.device,
              impressions: existing.impressions + device.impressions,
              clicks: existing.clicks + device.clicks,
              conversions: existing.conversions + device.conversions,
              spend: existing.spend + device.spend,
              revenue: existing.revenue + device.revenue,
              ctr: ((existing.clicks + device.clicks) / (existing.impressions + device.impressions)) * 100,
              conversion_rate: ((existing.conversions + device.conversions) / (existing.clicks + device.clicks)) * 100,
              percentage_of_traffic: existing.percentage_of_traffic + device.percentage_of_traffic,
            });
          } else {
            deviceMap.set(device.device, { ...device });
          }
        });
        
        const aggregatedDevices = Array.from(deviceMap.values());
        setDevicePerformance(aggregatedDevices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const summaryCardData = [
    { label: 'Mobile', color: 'bg-sky-700', device: 'Mobile' },
    { label: 'Desktop', color: 'bg-yellow-700', device: 'Desktop' },
    { label: 'Tablet', color: 'bg-purple-700', device: 'Tablet' },
  ];


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
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              {error ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
                  Error loading data: {error}
                </div>
              ) : loading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-white/20 rounded mb-4 max-w-md mx-auto"></div>
                </div>
              ) : marketingData ? (
                <h1 className="text-3xl md:text-5xl font-bold">
                  Device view
                </h1>
              ) :
              null
              }
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <div className="flex flex-col md:flex-row gap-6 px-6 py-8 justify-center">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white">Loading...</div>
            </div>
          ) : marketingData ? (
            summaryCardData.map(({ label, color, device }) => {
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
            })
          ) :
          null
          }
        </div>

        {/* Charts */}
        <main className="px-6 py-8 space-y-8">
          {/* Device Performance Comparison Chart */}
          {!loading && devicePerformance.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-center text-white">
                Device Performance Comparison
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={devicePerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="device" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: string) => [
                      typeof value === 'number' ? value.toLocaleString() : value,
                      name
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="impressions" fill="#3B82F6" name="Impressions" />
                  <Bar dataKey="clicks" fill="#10B981" name="Clicks" />
                  <Bar dataKey="conversions" fill="#F59E0B" name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Revenue and Spend Comparison */}
          {!loading && devicePerformance.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-center text-white">
                Revenue vs Spend by Device
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={devicePerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="device" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: string) => [
                      `$${typeof value === 'number' ? value.toLocaleString() : value}`,
                      name
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#059669" name="Revenue" />
                  <Bar dataKey="spend" fill="#DC2626" name="Spend" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Performance Metrics Chart */}
          {!loading && devicePerformance.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-center text-white">
                Performance Metrics by Device
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={devicePerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="device" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: string) => [
                      `${typeof value === 'number' ? value.toFixed(2) : value}%`,
                      name
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="ctr" fill="#8B5CF6" name="CTR (%)" />
                  <Bar dataKey="conversion_rate" fill="#EC4899" name="Conversion Rate (%)" />
                  <Bar dataKey="percentage_of_traffic" fill="#06B6D4" name="Traffic Share (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* No Data Message */}
          {!loading && devicePerformance.length === 0 && (
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-center">
              <p className="text-gray-400 text-lg">No device performance data available.</p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
