'use client'
import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { fetchMarketingData } from '../../src/lib/api';
import { Campaign, MarketingData } from '../../src/types/marketing';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '@/src/components/ui/table';
import { Footer } from '../../src/components/ui/footer';
import { TrendingUp, Target, DollarSign } from 'lucide-react';

export default function DemographicView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Aggregate data by age groups for bar charts
  const ageGroupData = useMemo(() => {
    if (!marketingData?.campaigns) return { spendByAge: [], revenueByAge: [] };

    const ageGroups: { [key: string]: { spend: number; revenue: number } } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.demographic_breakdown?.forEach(demo => {
        const ageGroup = demo.age_group;
        if (!ageGroups[ageGroup]) {
          ageGroups[ageGroup] = { spend: 0, revenue: 0 };
        }
        
        // Calculate proportional spend and revenue based on demographic performance
        const totalImpressions = campaign.impressions || 1;
        const demoWeight = demo.performance.impressions / totalImpressions;
        
        ageGroups[ageGroup].spend += (campaign.spend || 0) * demoWeight;
        ageGroups[ageGroup].revenue += (campaign.revenue || 0) * demoWeight;
      });
    });

    const spendByAge = Object.entries(ageGroups)
      .map(([ageGroup, data]) => ({
        label: ageGroup,
        value: data.spend,
        color: '#10B981'
      }))
      .sort((a, b) => b.value - a.value);

    const revenueByAge = Object.entries(ageGroups)
      .map(([ageGroup, data]) => ({
        label: ageGroup,
        value: data.revenue,
        color: '#3B82F6'
      }))
      .sort((a, b) => b.value - a.value);

    return { spendByAge, revenueByAge };
  }, [marketingData?.campaigns]);

  // Prepare table data for male age groups
  const maleAgeGroupData = useMemo(() => {
    if (!marketingData?.campaigns) return [];

    const maleData: any[] = [];

    marketingData.campaigns.forEach(campaign => {
      campaign.demographic_breakdown?.forEach(demo => {
        if (demo.gender.toLowerCase() === 'male') {
          maleData.push({
            campaign: campaign.name,
            age_group: demo.age_group,
            impressions: demo.performance.impressions.toLocaleString(),
            clicks: demo.performance.clicks.toLocaleString(),
            conversions: demo.performance.conversions.toLocaleString(),
            ctr: `${(demo.performance.ctr * 100).toFixed(2)}%`,
            conversion_rate: `${(demo.performance.conversion_rate * 100).toFixed(2)}%`
          });
        }
      });
    });

    return maleData;
  }, [marketingData?.campaigns]);

  // Prepare table data for female age groups
  const femaleAgeGroupData = useMemo(() => {
    if (!marketingData?.campaigns) return [];

    const femaleData: any[] = [];

    marketingData.campaigns.forEach(campaign => {
      campaign.demographic_breakdown?.forEach(demo => {
        if (demo.gender.toLowerCase() === 'female') {
          femaleData.push({
            campaign: campaign.name,
            age_group: demo.age_group,
            impressions: demo.performance.impressions.toLocaleString(),
            clicks: demo.performance.clicks.toLocaleString(),
            conversions: demo.performance.conversions.toLocaleString(),
            ctr: `${(demo.performance.ctr * 100).toFixed(2)}%`,
            conversion_rate: `${(demo.performance.conversion_rate * 100).toFixed(2)}%`
          });
        }
      });
    });

    return femaleData;
  }, [marketingData?.campaigns]);

  // Aggregate demographic performance by gender
  const demographicTotals = useMemo(() => {
    if (!marketingData?.campaigns) return { male: { clicks: 0, spend: 0, revenue: 0 }, female: { clicks: 0, spend: 0, revenue: 0 } };

    const totals = { male: { clicks: 0, spend: 0, revenue: 0 }, female: { clicks: 0, spend: 0, revenue: 0 } };

    marketingData.campaigns.forEach(campaign => {
      const campaignSpend = campaign.spend || 0;
      const campaignRevenue = campaign.revenue || 0;

      let maleClicks = 0;
      let femaleClicks = 0;

      campaign.demographic_breakdown?.forEach(demo => {
        if (demo.gender.toLowerCase() === 'male') {
          maleClicks += demo.performance.clicks;
        } else if (demo.gender.toLowerCase() === 'female') {
          femaleClicks += demo.performance.clicks;
        }
      });

      const totalCampaignClicks = maleClicks + femaleClicks;

      const maleSpend = totalCampaignClicks > 0 ? (maleClicks / totalCampaignClicks) * campaignSpend : 0;
      const femaleSpend = totalCampaignClicks > 0 ? (femaleClicks / totalCampaignClicks) * campaignSpend : 0;

      const maleRevenue = totalCampaignClicks > 0 ? (maleClicks / totalCampaignClicks) * campaignRevenue : 0;
      const femaleRevenue = totalCampaignClicks > 0 ? (femaleClicks / totalCampaignClicks) * campaignRevenue : 0;

      totals.male.clicks += maleClicks;
      totals.male.spend += maleSpend;
      totals.male.revenue += maleRevenue;

      totals.female.clicks += femaleClicks;
      totals.female.spend += femaleSpend;
      totals.female.revenue += femaleRevenue;
    });

    return totals;
  }, [marketingData?.campaigns]);

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
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
              ) : null}
            </div>
          </div>
        </section>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white">Loading...</div>
            </div>
          ) : marketingData && (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <CardMetric
                  title="Total Clicks by Males"
                  value={demographicTotals.male.clicks.toLocaleString()}
                  icon={<Target className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Spend by Males"
                  value={`$${demographicTotals.male.spend.toFixed(2)}`}
                  icon={<DollarSign className="h-5 w-5" />}
                  className="text-green-400"
                />
                <CardMetric
                  title="Total Revenue by Males"
                  value={`$${demographicTotals.male.revenue.toFixed(2)}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                  className="text-blue-400"
                />

                <CardMetric
                  title="Total Clicks by Females"
                  value={demographicTotals.female.clicks.toLocaleString()}
                  icon={<Target className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Spend by Females"
                  value={`$${demographicTotals.female.spend.toFixed(2)}`}
                  icon={<DollarSign className="h-5 w-5" />}
                  className="text-green-400"
                />
                <CardMetric
                  title="Total Revenue by Females"
                  value={`$${demographicTotals.female.revenue.toFixed(2)}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                  className="text-blue-400"
                />
              </div>

              {/* Bar Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <BarChart
                  title="Total Spend by Age Group"
                  data={ageGroupData.spendByAge}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />

                <BarChart
                  title="Total Revenue by Age Group"
                  data={ageGroupData.revenueByAge}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />
              </div>

              {/* Tables */}
              <div className="space-y-6">
                {/* Male Age Groups Table */}
                <div className="overflow-x-auto w-full max-w-full">
                  <Table
                    title="Campaign Performance by Male Age Groups"
                    showIndex={true}
                    maxHeight="400px"
                    columns={[
                      { key: 'campaign', header: 'Campaign', width: '25%', sortable: true, sortType: 'string' },
                      { key: 'age_group', header: 'Age Group', width: '15%', sortable: true, sortType: 'string' },
                      { key: 'impressions', header: 'Impressions', width: '15%', sortable: true, sortType: 'string' },
                      { key: 'clicks', header: 'Clicks', width: '12%', align: 'center', sortable: true, sortType: 'string' },
                      { key: 'conversions', header: 'Conversions', width: '13%', align: 'center', sortable: true, sortType: 'string' },
                      { key: 'ctr', header: 'CTR', width: '10%', align: 'center', sortable: true, sortType: 'string' },
                      { key: 'conversion_rate', header: 'Conversion Rate', width: '15%', align: 'right', sortable: true, sortType: 'string' }
                    ]}
                    defaultSort={{ key: 'impressions', direction: 'desc' }}
                    data={maleAgeGroupData}
                    emptyMessage="No male demographic data available"
                  />
                </div>

                {/* Female Age Groups Table */}
                <div className="overflow-x-auto w-full max-w-full">
                  <Table
                    title="Campaign Performance by Female Age Groups"
                    showIndex={true}
                    maxHeight="400px"
                    columns={[
                      { key: 'campaign', header: 'Campaign', width: '25%', sortable: true, sortType: 'string' },
                      { key: 'age_group', header: 'Age Group', width: '15%', sortable: true, sortType: 'string' },
                      { key: 'impressions', header: 'Impressions', width: '15%', sortable: true, sortType: 'string' },
                      { key: 'clicks', header: 'Clicks', width: '12%', align: 'center', sortable: true, sortType: 'string' },
                      { key: 'conversions', header: 'Conversions', width: '13%', align: 'center', sortable: true, sortType: 'string' },
                      { key: 'ctr', header: 'CTR', width: '10%', align: 'center', sortable: true, sortType: 'string' },
                      { key: 'conversion_rate', header: 'Conversion Rate', width: '15%', align: 'right', sortable: true, sortType: 'string' }
                    ]}
                    defaultSort={{ key: 'impressions', direction: 'desc' }}
                    data={femaleAgeGroupData}
                    emptyMessage="No female demographic data available"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}