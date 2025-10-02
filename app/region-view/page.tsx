'use client'
import React, { useState, useEffect } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, RegionalPerformance } from '../../src/types/marketing';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const cityCoordinates: Record<string, { x: number; y: number }> = {
  "Abu Dhabi": { x: 80, y: 70 },
  "Dubai": { x: 100, y: 80 },
  "Sharjah": { x: 90, y: 85 },
  "Riyadh": { x: 120, y: 60 },
  "Doha": { x: 130, y: 90 },
  "Kuwait City": { x: 140, y: 75 },
  "Manama": { x: 150, y: 95 },
};

export default function RegionView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);  
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);

        // ✅ Aggregate regional performance across all campaigns
        const regionMap: Record<string, RegionalPerformance> = {};
        data.campaigns.forEach((campaign) => {
          campaign.regional_performance.forEach((r) => {
            if (!regionMap[r.region]) {
              regionMap[r.region] = { ...r };
            } else {
              regionMap[r.region].impressions += r.impressions;
              regionMap[r.region].clicks += r.clicks;
              regionMap[r.region].conversions += r.conversions;
              regionMap[r.region].spend += r.spend;
              regionMap[r.region].revenue += r.revenue;
              // Recalculate derived metrics
              regionMap[r.region].ctr = regionMap[r.region].impressions > 0 
                ? (regionMap[r.region].clicks / regionMap[r.region].impressions) * 100 
                : 0;
              regionMap[r.region].conversion_rate = regionMap[r.region].clicks > 0 
                ? (regionMap[r.region].conversions / regionMap[r.region].clicks) * 100 
                : 0;
              regionMap[r.region].cpc = regionMap[r.region].clicks > 0 
                ? regionMap[r.region].spend / regionMap[r.region].clicks 
                : 0;
              regionMap[r.region].cpa = regionMap[r.region].conversions > 0 
                ? regionMap[r.region].spend / regionMap[r.region].conversions 
                : 0;
              regionMap[r.region].roas = regionMap[r.region].spend > 0 
                ? regionMap[r.region].revenue / regionMap[r.region].spend 
                : 0;
            }
          });
        });

        // ✅ Prepare chart-friendly data with comprehensive regional performance
        const chartData = Object.values(regionMap).map((r) => ({
          city: r.region,
          country: r.country,
          x: cityCoordinates[r.region]?.x || Math.random() * 200, // fallback to random
          y: cityCoordinates[r.region]?.y || Math.random() * 200,
          value: r.revenue, // Circle size based on revenue for better business insight
          impressions: r.impressions,
          clicks: r.clicks,
          conversions: r.conversions,
          spend: r.spend,
          revenue: r.revenue,
          ctr: r.ctr,
          conversion_rate: r.conversion_rate,
          cpc: r.cpc,
          cpa: r.cpa,
          roas: r.roas,
        }));

        setRegions(chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading marketing data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
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
                  Regional View
                </h1>
              ) : null}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          { loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white">Loading...</div>
            </div>
          ) : marketingData ? (
            <div className="space-y-6">
              {/* Regional Performance Scatter Chart */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Regional Performance Overview</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Circle size represents revenue. Hover over each region for detailed metrics.
                </p>
                <div style={{ width: "100%", height: 500 }}>
                  <ResponsiveContainer>
                    <ScatterChart>
                      <CartesianGrid />
                      <XAxis type="number" dataKey="x" hide />
                      <YAxis type="number" dataKey="y" hide />
                      <ZAxis type="number" dataKey="value" range={[60, 400]} name="Revenue" />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div style={{ 
                                background: "#1f2937", 
                                color: "#fff",
                                padding: "12px", 
                                border: "1px solid #374151",
                                borderRadius: "8px",
                                fontSize: "14px",
                                minWidth: "250px"
                              }}>
                                <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "16px" }}>
                                  {d.city} ({d.country})
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                                  <div><strong>Revenue:</strong> ${d.revenue?.toLocaleString() || 0}</div>
                                  <div><strong>Spend:</strong> ${d.spend?.toLocaleString() || 0}</div>
                                  <div><strong>Impressions:</strong> {d.impressions?.toLocaleString() || 0}</div>
                                  <div><strong>Clicks:</strong> {d.clicks?.toLocaleString() || 0}</div>
                                  <div><strong>Conversions:</strong> {d.conversions?.toLocaleString() || 0}</div>
                                  <div><strong>CTR:</strong> {d.ctr?.toFixed(2) || 0}%</div>
                                  <div><strong>Conv. Rate:</strong> {d.conversion_rate?.toFixed(2) || 0}%</div>
                                  <div><strong>CPC:</strong> ${d.cpc?.toFixed(2) || 0}</div>
                                  <div><strong>CPA:</strong> ${d.cpa?.toFixed(2) || 0}</div>
                                  <div><strong>ROAS:</strong> {d.roas?.toFixed(2) || 0}x</div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Scatter name="Regional Performance" data={regions} fill="#3B82F6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Regional Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Total Regions</h4>
                  <p className="text-2xl font-bold text-white">{regions.length}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Total Revenue</h4>
                  <p className="text-2xl font-bold text-green-400">
                    ${regions.reduce((sum, r) => sum + (r.revenue || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Total Conversions</h4>
                  <p className="text-2xl font-bold text-blue-400">
                    {regions.reduce((sum, r) => sum + (r.conversions || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Avg ROAS</h4>
                  <p className="text-2xl font-bold text-purple-400">
                    {regions.length > 0 
                      ? (regions.reduce((sum, r) => sum + (r.roas || 0), 0) / regions.length).toFixed(2)
                      : '0.00'
                    }x
                  </p>
                </div>
              </div>

              {/* Top Performing Regions Table */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Top Performing Regions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                      <tr>
                        <th className="px-4 py-3">Region</th>
                        <th className="px-4 py-3">Revenue</th>
                        <th className="px-4 py-3">Conversions</th>
                        <th className="px-4 py-3">ROAS</th>
                        <th className="px-4 py-3">CTR</th>
                        <th className="px-4 py-3">Conv. Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regions
                        .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                        .slice(0, 10)
                        .map((region, index) => (
                          <tr key={region.city} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                            <td className="px-4 py-3 font-medium text-white">
                              {region.city} ({region.country})
                            </td>
                            <td className="px-4 py-3 text-green-400">
                              ${(region.revenue || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-blue-400">
                              {(region.conversions || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-purple-400">
                              {(region.roas || 0).toFixed(2)}x
                            </td>
                            <td className="px-4 py-3 text-yellow-400">
                              {(region.ctr || 0).toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 text-orange-400">
                              {(region.conversion_rate || 0).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) :
          null
          }
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
