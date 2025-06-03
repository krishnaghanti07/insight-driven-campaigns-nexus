
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCRM } from '@/contexts/CRMContext';
import { Users, Send, TrendingUp, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { customers, campaigns } = useCRM();

  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const recentCampaigns = campaigns.slice(0, 3);
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);

  const stats = [
    {
      title: 'Total Customers',
      value: customers.length.toString(),
      description: `${activeCustomers} active`,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      description: 'Lifetime value',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Campaigns Sent',
      value: campaigns.length.toString(),
      description: `${totalSent} messages delivered`,
      icon: Send,
      color: 'purple'
    },
    {
      title: 'Delivery Rate',
      value: campaigns.length > 0 ? `${Math.round((totalSent / campaigns.reduce((sum, c) => sum + c.audienceSize, 0)) * 100)}%` : '0%',
      description: 'Success rate',
      icon: MessageSquare,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your CRM platform. Here's what's happening today.
          </p>
        </div>
        <Button asChild>
          <Link to="/campaigns/create">Create Campaign</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>
              Your latest campaign activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length > 0 ? (
              <div className="space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.audienceSize} recipients • {campaign.sentCount} sent
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'sent' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/campaigns">View All Campaigns</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Send className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first campaign.</p>
                <div className="mt-6">
                  <Button asChild>
                    <Link to="/campaigns/create">Create Campaign</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>
              Breakdown of your customer base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['VIP', 'Premium', 'Regular', 'New'].map((segment) => {
                const count = customers.filter(c => c.segment === segment).length;
                const percentage = customers.length > 0 ? (count / customers.length) * 100 : 0;
                return (
                  <div key={segment} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        segment === 'VIP' ? 'bg-purple-500' :
                        segment === 'Premium' ? 'bg-blue-500' :
                        segment === 'Regular' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-sm font-medium">{segment}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{count}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
