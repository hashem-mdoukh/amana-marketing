'use client'
import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { fetchMarketingData } from '../../src/lib/api';
import { Campaign, MarketingData, DemographicBreakdown } from '../../src/types/marketing';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '@/src/components/ui/table';
import { Footer } from '../../src/components/ui/footer';
import { TrendingUp, Target, DollarSign } from 'lucide-react';


export default function DemographicView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);  
  const [loading, setLoading] = useState(true);

  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  // Load data on component mount
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

  // Filter campaigns based on current filter values
    const filteredCampaigns = useMemo(() => {
      if (!marketingData?.campaigns) return [];
  
      return marketingData.campaigns.filter((campaign: Campaign) => {
        const matchesName = campaign.name.toLowerCase().includes(nameFilter.toLowerCase());
        const matchesType = typeFilter.length === 0 || typeFilter.includes(campaign.objective);
        
        return matchesName && matchesType;
      });
    }, [marketingData?.campaigns, nameFilter, typeFilter]);
  
    // Get unique campaign types for the dropdown
    const campaignTypes = useMemo(() => {
      if (!marketingData?.campaigns) return [];
      return [...new Set(marketingData.campaigns.map((campaign: Campaign) => campaign.objective))];
    }, [marketingData?.campaigns]);

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
                  Demographic View
                </h1>
              ) :
              null
              }
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white">Loading...</div>
            </div>
          ) : marketingData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Key Metrics Cards */}
                <CardMetric
                  title="Total Clicks by Males"
                  value={marketingData.marketing_stats.total_clicks}
                  icon={<Target className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Total Spend by Males"
                  value={`$${marketingData.marketing_stats.total_spend.toLocaleString()}`}
                  icon={<DollarSign className="h-5 w-5" />}
                  className="text-green-400"
                />
                
                <CardMetric
                  title="Total Revenue by Males"
                  value={`${marketingData.marketing_stats.total_revenue}x`}
                  icon={<TrendingUp className="h-5 w-5" />}
                  className="text-blue-400"
                />
                  <CardMetric
                    title="Total Clicks by Females"
                    value={marketingData.marketing_stats.total_clicks}
                    icon={<Target className="h-5 w-5" />}
                  />
                  
                  <CardMetric
                    title="Total Spend by Females"
                    value={`$${marketingData.marketing_stats.total_spend.toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    className="text-green-400"
                  />
                  
                  <CardMetric
                    title="Total Revenue by Females"
                    value={`${marketingData.marketing_stats.total_revenue}x`}
                    icon={<TrendingUp className="h-5 w-5" />}
                    className="text-blue-400"
                  />
              </div>

              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Top Campaigns by Revenue */}
                <BarChart
                  title="Total Spend by Age Group"
                  data={filteredCampaigns.slice(0, 6).map(campaign => ({
                    label: campaign.name.split(' - ')[0],
                    value: campaign.revenue,
                    color: '#10B981'
                  }))}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />

                {/* Campaign ROAS Comparison */}
                <BarChart
                  title="Total Revenue by Age Group"
                  data={filteredCampaigns.slice(0, 6).map(campaign => ({
                    label: campaign.name.split(' - ')[0],
                    value: campaign.roas,
                    color: '#3B82F6'
                  }))}
                  formatValue={(value) => `${value.toFixed(1)}x`}
                />
              </div>  
              

              <div className="overflow-x-auto w-full max-w-full">
                <Table
                  title="Campaign Performance by Male Age Groups"
                  showIndex={true}
                  maxHeight="400px"
                columns={[
                  {
                    key: 'impressions',
                    header: 'Impressions',
                    width: '20%',
                    sortable: true,
                    sortType: 'string',
                  },
                  {
                    key: 'clicks',
                    header: 'Clicks',
                    width: '12%',
                    align: 'center',
                    sortable: true,
                    sortType: 'string',
                  },
                  {
                    key: 'conversions',
                    header: 'Conversions',
                    width: '10%',
                    align: 'center',
                    sortable: true,
                    sortType: 'string',
                  },
                  {
                    key: 'ctr',
                    header: 'CTR',
                    width: '10%',
                    align: 'center',
                    sortable: true,
                    sortType: 'string'
                  },
                  {
                    key: 'conversion_rate',
                    header: 'Conversion Rates',
                    width: '12%',
                    align: 'right',
                    sortable: true,
                    sortType: 'number',
                  }
                ]}
                defaultSort={{ key: 'revenue', direction: 'desc' }}
                data={filteredCampaigns}
                emptyMessage="No campaigns match the current filters"
                />
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
