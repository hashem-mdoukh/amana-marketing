'use client'
import React, {useState, useEffect} from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import RevenueSpendLineChart from "../../src/components/ui/line-chart";
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, WeeklyPerformance  } from '../../src/types/marketing';


export default function WeeklyView() {

  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [weekly, setWeekly] = useState<WeeklyPerformance[]>([])
  const [error, setError] = useState<string | null>(null);  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
        
        // Extract weekly performance data from all campaigns
        const allWeeklyData: WeeklyPerformance[] = [];
        data.campaigns.forEach(campaign => {
          if (campaign.weekly_performance) {
            allWeeklyData.push(...campaign.weekly_performance);
          }
        });
        
        // Group by week and aggregate the data
        const weeklyMap = new Map<string, WeeklyPerformance>();
        allWeeklyData.forEach(week => {
          const weekKey = `${week.week_start}-${week.week_end}`;
          if (weeklyMap.has(weekKey)) {
            const existing = weeklyMap.get(weekKey)!;
            weeklyMap.set(weekKey, {
              week_start: week.week_start,
              week_end: week.week_end,
              impressions: existing.impressions + week.impressions,
              clicks: existing.clicks + week.clicks,
              conversions: existing.conversions + week.conversions,
              spend: existing.spend + week.spend,
              revenue: existing.revenue + week.revenue,
            });
          } else {
            weeklyMap.set(weekKey, { ...week });
          }
        });
        
        // Convert map to array and sort by week_start
        const aggregatedWeekly = Array.from(weeklyMap.values()).sort(
          (a, b) => new Date(a.week_start).getTime() - new Date(b.week_start).getTime()
        );
        
        setWeekly(aggregatedWeekly);
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
                  weekly view
                </h1>
              ) :
              null
              }
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {!loading && marketingData && weekly.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Revenue and Spend by Week</h2>
              <RevenueSpendLineChart data={weekly} />
            </div>
          )}
          {!loading && marketingData && weekly.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <p className="text-gray-600">No weekly performance data available.</p>
            </div>
          )}
        </div>


        <Footer />
      </div>
    </div>
  );
}
