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
              regionMap[r.region].revenue += r.revenue;
            }
          });
        });

        // ✅ Prepare chart-friendly data
        const chartData = Object.values(regionMap).map((r) => ({
          city: r.region,
          x: cityCoordinates[r.region]?.x || Math.random() * 200, // fallback to random
          y: cityCoordinates[r.region]?.y || Math.random() * 200,
          value: r.impressions, // Circle size based on impressions
          conversions: r.conversions,
          revenue: r.revenue,
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
          <div style={{ width: "100%", height: 500 }}>
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" hide />
                <YAxis type="number" dataKey="y" hide />
                <ZAxis type="number" dataKey="value" range={[60, 400]} name="Impressions" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div style={{ background: "#fff", padding: 10, border: "1px solid #ccc" }}>
                          <strong>{d.city}</strong> <br />
                          Impressions: {d.value.toLocaleString()} <br />
                          Conversions: {d.conversions.toLocaleString()} <br />
                          Revenue: ${d.revenue.toLocaleString()}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Scatter name="Cities" data={regions} fill="#d62728" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
