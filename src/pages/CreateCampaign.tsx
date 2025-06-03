
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCRM, CampaignRule } from '@/contexts/CRMContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users, Wand2, Eye } from 'lucide-react';

const CreateCampaign = () => {
  const { getAudienceSize, createCampaign, generateAIMessage, filterCustomers } = useCRM();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    message: ''
  });

  const [rules, setRules] = useState<CampaignRule[]>([]);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const addRule = () => {
    const newRule: CampaignRule = {
      id: Date.now().toString(),
      field: 'totalSpent',
      operator: '>',
      value: 0,
      connector: rules.length > 0 ? 'AND' : undefined
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (id: string, updates: Partial<CampaignRule>) => {
    setRules(rules.map(rule => rule.id === id ? { ...rule, ...updates } : rule));
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const audienceSize = getAudienceSize(rules);
  const previewCustomers = filterCustomers(rules).slice(0, 5);

  const handleGenerateMessage = async () => {
    if (rules.length === 0) {
      toast({
        title: "Add Audience Rules",
        description: "Please add at least one rule to generate a targeted message",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingMessage(true);
    try {
      const audienceDescription = rules.map(rule => 
        `${rule.field} ${rule.operator} ${rule.value}`
      ).join(` ${rules[0]?.connector || 'AND'} `);
      
      const generatedMessage = await generateAIMessage(audienceDescription);
      setCampaignData(prev => ({ ...prev, message: generatedMessage }));
      toast({
        title: "Message Generated!",
        description: "AI has generated a personalized message for your campaign"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaignData.name || !campaignData.message || rules.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and add at least one rule",
        variant: "destructive"
      });
      return;
    }

    if (audienceSize === 0) {
      toast({
        title: "No Audience",
        description: "Your rules don't match any customers. Please adjust your criteria.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createCampaign({
        ...campaignData,
        rules,
        audienceSize,
        status: 'sent'
      });

      toast({
        title: "Campaign Created!",
        description: `Campaign sent to ${audienceSize} customers`,
      });

      navigate('/campaigns');
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Campaign</h2>
        <p className="text-muted-foreground">
          Build targeted campaigns with dynamic audience segmentation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Basic information about your campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  placeholder="Summer Sale 2024"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Special offer for high-value customers"
                  value={campaignData.description}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Audience Rules</CardTitle>
                <CardDescription>
                  Define your target audience with flexible conditions
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addRule}>
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.length > 0 ? (
              <div className="space-y-4">
                {rules.map((rule, index) => (
                  <div key={rule.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {index > 0 && (
                      <Select
                        value={rules[index - 1].connector}
                        onValueChange={(value) => updateRule(rules[index - 1].id, { connector: value as 'AND' | 'OR' })}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    <Select
                      value={rule.field}
                      onValueChange={(value) => updateRule(rule.id, { field: value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="totalSpent">Total Spent</SelectItem>
                        <SelectItem value="totalOrders">Total Orders</SelectItem>
                        <SelectItem value="segment">Segment</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="lastOrderDate">Days Since Last Order</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={rule.operator}
                      onValueChange={(value) => updateRule(rule.id, { operator: value })}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rule.field === 'segment' || rule.field === 'status' ? (
                          <>
                            <SelectItem value="=">=</SelectItem>
                            <SelectItem value="!=">!=</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value=">">&gt;</SelectItem>
                            <SelectItem value="<">&lt;</SelectItem>
                            <SelectItem value=">=">&gt;=</SelectItem>
                            <SelectItem value="<=">&lt;=</SelectItem>
                            <SelectItem value="=">=</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>

                    {rule.field === 'segment' ? (
                      <Select
                        value={rule.value as string}
                        onValueChange={(value) => updateRule(rule.id, { value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VIP">VIP</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                          <SelectItem value="Regular">Regular</SelectItem>
                          <SelectItem value="New">New</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : rule.field === 'status' ? (
                      <Select
                        value={rule.value as string}
                        onValueChange={(value) => updateRule(rule.id, { value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="number"
                        className="w-32"
                        value={rule.value}
                        onChange={(e) => updateRule(rule.id, { value: Number(e.target.value) })}
                        placeholder="Value"
                      />
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <p>No rules defined yet. Add a rule to start building your audience.</p>
              </div>
            )}

            {rules.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Audience Size: {audienceSize} customers</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showPreview ? 'Hide' : 'Preview'}
                </Button>
              </div>
            )}

            {showPreview && audienceSize > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Audience Preview</CardTitle>
                  <CardDescription>First 5 customers matching your criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {previewCustomers.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{customer.segment}</Badge>
                          <p className="text-sm text-muted-foreground">₹{customer.totalSpent.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Campaign Message</CardTitle>
                <CardDescription>
                  Craft your message or let AI generate one for you
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateMessage}
                disabled={isGeneratingMessage || rules.length === 0}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGeneratingMessage ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Hi {name}, here's a special offer just for you!"
                value={campaignData.message}
                onChange={(e) => setCampaignData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                required
              />
              <p className="text-sm text-muted-foreground">
                Use {"{name}"} to personalize the message with customer names
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/campaigns')}>
            Cancel
          </Button>
          <Button type="submit" disabled={audienceSize === 0}>
            Create & Send Campaign
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
