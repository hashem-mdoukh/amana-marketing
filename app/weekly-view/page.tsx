'use client'
import React, {useState, useEffect} from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import RevenueSpendLineChart from "../../src/components/ui/line-chart";
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, WeeklyPerformance  } from '../../src/types/marketing';


export default function WeeklyView() {

  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
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
          {!loading && marketingData?.campaigns && (
            <RevenueSpendLineChart
              data={marketingData.campaigns.map((campaign: any) => ({
                // Map/transform campaign fields to WeeklyPerformance fields as needed
                week_start: campaign.week_start,
                week_end: campaign.week_end,
                ...campaign
              }))}
            />
          )}
        </div>


        <Footer />
      </div>
    </div>
  );
}
