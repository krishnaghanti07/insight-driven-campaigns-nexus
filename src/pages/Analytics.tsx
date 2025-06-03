
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRM } from '@/contexts/CRMContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, DollarSign, Mail } from 'lucide-react';

const Analytics = () => {
  const { customers, campaigns } = useCRM();

  // Segment distribution data
  const segmentData = ['VIP', 'Premium', 'Regular', 'New'].map(segment => ({
    name: segment,
    value: customers.filter(c => c.segment === segment).length,
    revenue: customers.filter(c => c.segment === segment).reduce((sum, c) => sum + c.totalSpent, 0)
  }));

  // Campaign performance data
  const campaignPerformance = campaigns.map(campaign => ({
    name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
    sent: campaign.sentCount,
    failed: campaign.failedCount,
    rate: campaign.audienceSize > 0 ? Math.round((campaign.sentCount / campaign.audienceSize) * 100) : 0
  }));

  // Revenue by segment
  const revenueBySegment = segmentData.filter(d => d.value > 0);

  // Colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.totalOrders, 1);
  const totalCampaignsSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const avgDeliveryRate = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + (c.audienceSize > 0 ? (c.sentCount / c.audienceSize) * 100 : 0), 0) / campaigns.length 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Insights and performance metrics for your CRM platform
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime customer value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(avgOrderValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCampaignsSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total campaigns delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgDeliveryRate)}%</div>
            <p className="text-xs text-muted-foreground">
              Average success rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Distribution of customers by segment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Segment */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Segment</CardTitle>
            <CardDescription>Total revenue generated by each customer segment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueBySegment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Delivery success rates for recent campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            {campaignPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sent" fill="#82ca9d" name="Messages Sent" />
                  <Bar dataKey="failed" fill="#ff7300" name="Failed Deliveries" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Mail className="mx-auto h-12 w-12 mb-4" />
                  <p>No campaign data available</p>
                  <p className="text-sm">Create campaigns to see performance metrics</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI-Generated Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>Intelligent analysis of your customer data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Customer Segmentation Insight</h4>
              <p className="text-blue-800 text-sm">
                Your VIP customers ({segmentData.find(s => s.name === 'VIP')?.value || 0}) represent the highest value segment, 
                contributing ₹{(segmentData.find(s => s.name === 'VIP')?.revenue || 0).toLocaleString()} 
                in total revenue. Consider creating exclusive campaigns for this segment.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Campaign Performance</h4>
              <p className="text-green-800 text-sm">
                Your average campaign delivery rate is {Math.round(avgDeliveryRate)}%. 
                {avgDeliveryRate > 85 
                  ? "Excellent performance! Your messaging strategy is working well."
                  : "Consider reviewing your messaging strategy to improve delivery rates."
                }
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Revenue Opportunity</h4>
              <p className="text-orange-800 text-sm">
                Customers in the 'Regular' segment show potential for upselling. 
                With an average spend of ₹{Math.round(
                  (segmentData.find(s => s.name === 'Regular')?.revenue || 0) / 
                  (segmentData.find(s => s.name === 'Regular')?.value || 1)
                ).toLocaleString()}, 
                targeted campaigns could help move them to Premium status.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
