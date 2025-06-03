
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  totalOrders: number;
  lastOrderDate: string;
  segment: string;
  status: 'active' | 'inactive';
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  audienceSize: number;
  status: 'draft' | 'sent' | 'failed';
  sentCount: number;
  failedCount: number;
  createdAt: string;
  message: string;
  rules: CampaignRule[];
}

export interface CampaignRule {
  id: string;
  field: string;
  operator: string;
  value: string | number;
  connector?: 'AND' | 'OR';
}

interface CRMContextType {
  customers: Customer[];
  campaigns: Campaign[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'failedCount'>) => Promise<string>;
  generateAIMessage: (audienceDescription: string) => Promise<string>;
  getAudienceSize: (rules: CampaignRule[]) => number;
  filterCustomers: (rules: CampaignRule[]) => Customer[];
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 9876543210',
    totalSpent: 15000,
    totalOrders: 8,
    lastOrderDate: '2024-05-15',
    segment: 'VIP',
    status: 'active'
  },
  {
    id: '2',
    name: 'Priya Singh',
    email: 'priya@example.com',
    phone: '+91 9876543211',
    totalSpent: 7500,
    totalOrders: 4,
    lastOrderDate: '2024-04-20',
    segment: 'Regular',
    status: 'active'
  },
  {
    id: '3',
    name: 'Mohit Kumar',
    email: 'mohit@example.com',
    phone: '+91 9876543212',
    totalSpent: 25000,
    totalOrders: 15,
    lastOrderDate: '2024-05-28',
    segment: 'Premium',
    status: 'active'
  },
  {
    id: '4',
    name: 'Sneha Patel',
    email: 'sneha@example.com',
    phone: '+91 9876543213',
    totalSpent: 3000,
    totalOrders: 2,
    lastOrderDate: '2024-01-10',
    segment: 'New',
    status: 'inactive'
  },
  {
    id: '5',
    name: 'Arjun Reddy',
    email: 'arjun@example.com',
    phone: '+91 9876543214',
    totalSpent: 12000,
    totalOrders: 6,
    lastOrderDate: '2024-05-25',
    segment: 'Regular',
    status: 'active'
  }
];

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    // Load campaigns from localStorage
    const storedCampaigns = localStorage.getItem('crm_campaigns');
    if (storedCampaigns) {
      setCampaigns(JSON.parse(storedCampaigns));
    }
  }, []);

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = {
      ...customer,
      id: Date.now().toString()
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id ? { ...customer, ...updates } : customer
    ));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  const filterCustomers = (rules: CampaignRule[]): Customer[] => {
    if (rules.length === 0) return customers;

    return customers.filter(customer => {
      let result = true;
      let currentResult = true;

      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        let ruleResult = false;

        switch (rule.field) {
          case 'totalSpent':
            const spent = customer.totalSpent;
            switch (rule.operator) {
              case '>':
                ruleResult = spent > Number(rule.value);
                break;
              case '<':
                ruleResult = spent < Number(rule.value);
                break;
              case '>=':
                ruleResult = spent >= Number(rule.value);
                break;
              case '<=':
                ruleResult = spent <= Number(rule.value);
                break;
              case '=':
                ruleResult = spent === Number(rule.value);
                break;
            }
            break;

          case 'totalOrders':
            const orders = customer.totalOrders;
            switch (rule.operator) {
              case '>':
                ruleResult = orders > Number(rule.value);
                break;
              case '<':
                ruleResult = orders < Number(rule.value);
                break;
              case '>=':
                ruleResult = orders >= Number(rule.value);
                break;
              case '<=':
                ruleResult = orders <= Number(rule.value);
                break;
              case '=':
                ruleResult = orders === Number(rule.value);
                break;
            }
            break;

          case 'segment':
            ruleResult = rule.operator === '=' 
              ? customer.segment === rule.value 
              : customer.segment !== rule.value;
            break;

          case 'status':
            ruleResult = rule.operator === '=' 
              ? customer.status === rule.value 
              : customer.status !== rule.value;
            break;

          case 'lastOrderDate':
            const daysSinceLastOrder = Math.floor(
              (new Date().getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            switch (rule.operator) {
              case '>':
                ruleResult = daysSinceLastOrder > Number(rule.value);
                break;
              case '<':
                ruleResult = daysSinceLastOrder < Number(rule.value);
                break;
            }
            break;
        }

        if (i === 0) {
          currentResult = ruleResult;
          result = currentResult;
        } else {
          const connector = rules[i - 1].connector || 'AND';
          if (connector === 'AND') {
            currentResult = currentResult && ruleResult;
          } else {
            currentResult = currentResult || ruleResult;
          }
          result = currentResult;
        }
      }

      return result;
    });
  };

  const getAudienceSize = (rules: CampaignRule[]): number => {
    return filterCustomers(rules).length;
  };

  const generateAIMessage = async (audienceDescription: string): Promise<string> => {
    // Simulate AI API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const templates = [
      `Hi {name}, we miss you! Here's a special 15% off on your next order just for you! 🎉`,
      `Hello {name}, exclusive offer inside! Get 20% off your favorite items. Limited time only! ⏰`,
      `{name}, your VIP discount is here! Enjoy 25% off premium products. Shop now! 💎`,
      `Hey {name}, we have something special for you! Get 10% off your next purchase! 🛍️`,
      `{name}, come back and save big! Special 30% discount waiting for you! 🔥`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'failedCount'>): Promise<string> => {
    const campaignId = Date.now().toString();
    const targetCustomers = filterCustomers(campaignData.rules);
    
    // Simulate campaign delivery
    const sentCount = Math.floor(targetCustomers.length * 0.9); // 90% success rate
    const failedCount = targetCustomers.length - sentCount;
    
    const newCampaign: Campaign = {
      ...campaignData,
      id: campaignId,
      createdAt: new Date().toISOString(),
      sentCount,
      failedCount,
      status: 'sent'
    };

    setCampaigns(prev => {
      const updated = [newCampaign, ...prev];
      localStorage.setItem('crm_campaigns', JSON.stringify(updated));
      return updated;
    });

    // Simulate delivery receipts
    setTimeout(() => {
      console.log(`Campaign ${campaignId} delivery completed: ${sentCount} sent, ${failedCount} failed`);
    }, 2000);

    return campaignId;
  };

  return (
    <CRMContext.Provider value={{
      customers,
      campaigns,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      createCampaign,
      generateAIMessage,
      getAudienceSize,
      filterCustomers
    }}>
      {children}
    </CRMContext.Provider>
  );
};
