import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Activity, TrendingUp, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: string;
  username: string | null;
  subscription_tier: string;
  api_quota_remaining: number;
  api_quota_limit: number;
  created_at: string;
  roles: string[];
  usage: {
    totalCost: string;
    totalTokens: number;
    analysisCount: number;
  };
}

interface PlatformStats {
  overview: {
    totalUsers: number;
    totalRecordings: number;
    totalAnalyses: number;
    totalCost: string;
    totalTokens: number;
  };
  tiers: Record<string, number>;
  recent: {
    newUsers: number;
    newAnalyses: number;
  };
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) throw error;
      
      setIsAdmin(!!data);
      
      if (!data) {
        toast.error('Access Denied: Admin privileges required');
        navigate('/');
      }
    } catch (error: any) {
      console.error('[Admin] Status check failed:', error);
      toast.error('Failed to verify admin status');
      navigate('/');
    } finally {
      setCheckingAdmin(false);
    }
  };

  const loadUsers = async () => {
    setLoadingData(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('admin-list-users', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        setUsers(data.users);
      }
    } catch (error: any) {
      console.error('[Admin] Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingData(false);
    }
  };

  const loadStats = async () => {
    setLoadingData(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('admin-platform-stats', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        setStats(data.stats);
      }
    } catch (error: any) {
      console.error('[Admin] Failed to load stats:', error);
      toast.error('Failed to load platform statistics');
    } finally {
      setLoadingData(false);
    }
  };

  const adjustQuota = async (userId: string, newRemaining: number, newLimit: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('admin-adjust-quota', {
        body: {
          targetUserId: userId,
          newQuotaRemaining: newRemaining,
          newQuotaLimit: newLimit
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success('Quota updated successfully');
        loadUsers(); // Refresh user list
      }
    } catch (error: any) {
      console.error('[Admin] Failed to adjust quota:', error);
      toast.error('Failed to adjust quota');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform management and analytics</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => { loadUsers(); loadStats(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" onClick={loadStats}>
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" onClick={loadUsers}>
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">+{stats.recent.newUsers} this week</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.overview.totalAnalyses}</div>
                    <p className="text-xs text-muted-foreground">+{stats.recent.newAnalyses} this week</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats.overview.totalCost}</div>
                    <p className="text-xs text-muted-foreground">All-time API usage</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.overview.totalTokens.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">AI tokens consumed</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Tiers</CardTitle>
                  <CardDescription>User distribution across plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.tiers).map(([tier, count]) => (
                      <div key={tier} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={tier === 'enterprise' ? 'default' : tier === 'pro' ? 'secondary' : 'outline'}>
                            {tier}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">{count} users</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage user quotas</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Quota</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.username || 'No username'}
                        <div className="text-xs text-muted-foreground">{user.id.slice(0, 8)}...</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.subscription_tier === 'enterprise' ? 'default' : 'secondary'}>
                          {user.subscription_tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles.map(role => (
                            <Badge key={role} variant="outline">{role}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.api_quota_remaining} / {user.api_quota_limit}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.usage.analysisCount} analyses
                          <div className="text-xs text-muted-foreground">
                            ${user.usage.totalCost}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newLimit = prompt('Enter new quota limit:', user.api_quota_limit.toString());
                            if (newLimit) {
                              adjustQuota(user.id, parseInt(newLimit), parseInt(newLimit));
                            }
                          }}
                        >
                          Adjust Quota
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
