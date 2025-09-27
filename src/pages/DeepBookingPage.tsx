import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  FileText, 
  CreditCard, 
  Mail,
  Search,
  Filter,
  Plus,
  Star,
  Users,
  DollarSign,
  Clock,
  Target,
  Play,
  Settings,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Glassmorphism theme constants
const THEME = {
  cardBorder: '1px solid rgba(255,255,255,0.12)',
  cardBg: 'rgba(255,255,255,0.10)',
  cardHoverBg: 'rgba(255,255,255,0.14)',
  textOnGlass: 'rgba(255,255,255,0.92)',
  primary: '#22d3ee',
  accent: '#a78bfa',
  success: '#34d399',
  danger: '#fb7185',
  ink: '#0b1220'
};

// Mock venue data
const mockVenues = [
  {
    id: '1',
    name: 'The Fillmore',
    city: 'San Francisco',
    capacity: 1150,
    email: 'booking@thefillmore.com',
    booker_name: 'Sarah Chen',
    genres: ['Rock', 'Indie', 'Electronic'],
    fit_score: 92,
    type: 'Theater',
    avg_ticket: 45
  },
  {
    id: '2',
    name: 'Bottom of the Hill',
    city: 'San Francisco',
    capacity: 300,
    email: 'shows@bottomofthehill.com',
    booker_name: 'Mike Rodriguez',
    genres: ['Indie', 'Punk', 'Alternative'],
    fit_score: 88,
    type: 'Club',
    avg_ticket: 25
  },
  {
    id: '3',
    name: 'The Independent',
    city: 'San Francisco',
    capacity: 500,
    email: 'booking@theindependentsf.com',
    booker_name: 'Alex Kim',
    genres: ['Alternative', 'Indie', 'Electronic'],
    fit_score: 85,
    type: 'Venue',
    avg_ticket: 35
  },
  {
    id: '4',
    name: 'Great American Music Hall',
    city: 'San Francisco',
    capacity: 470,
    email: 'booking@gamh.com',
    booker_name: 'Emma Johnson',
    genres: ['Folk', 'Jazz', 'Alternative'],
    fit_score: 82,
    type: 'Hall',
    avg_ticket: 40
  }
];

// Sidebar navigation items
const sidebarItems = [
  { icon: Sparkles, label: 'Booky', badge: 'NEW', route: '/booky', active: true },
  { icon: BarChart3, label: 'Dashboard', badge: 'OWNER', route: '/dashboard' },
  { icon: BarChart3, label: 'Overview', route: '/overview' },
  { icon: TrendingUp, label: 'Analytics', route: '/analytics' },
  { icon: MapPin, label: 'Venues', route: '/venues' },
  { icon: Calendar, label: 'Bookings', route: '/bookings' },
  { icon: FileText, label: 'Contracts', route: '/contracts' },
  { icon: CreditCard, label: 'Payments', route: '/payments' },
  { icon: Mail, label: 'Emails', route: '/emails' }
];

// Glass card component
const GlassCard: React.FC<{ children: React.ReactNode; className?: string; hover?: boolean }> = ({ 
  children, 
  className = '',
  hover = true 
}) => (
  <motion.div
    className={`backdrop-blur-xl border rounded-2xl shadow-lg transition-all duration-300 ${
      hover ? 'hover:shadow-xl hover:scale-[1.02]' : ''
    } ${className}`}
    style={{
      background: THEME.cardBg,
      borderColor: 'rgba(255,255,255,0.12)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    }}
    whileHover={hover ? { y: -3 } : {}}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    {children}
  </motion.div>
);

// Venue card component
const VenueCard: React.FC<{ venue: typeof mockVenues[0] }> = ({ venue }) => (
  <GlassCard className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge 
            variant="secondary" 
            className="text-xs font-medium"
            style={{ 
              background: `${THEME.primary}20`,
              color: THEME.primary,
              border: `1px solid ${THEME.primary}30`
            }}
          >
            {venue.type}
          </Badge>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-white/80">{venue.fit_score}</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{venue.name}</h3>
        <p className="text-sm text-white/70">{venue.city}</p>
      </div>
      <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
        <Play className="h-4 w-4" />
      </Button>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70">Capacity</span>
        <span className="text-white font-medium">{venue.capacity.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70">Avg Ticket</span>
        <span className="text-white font-medium">${venue.avg_ticket}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70">Booker</span>
        <span className="text-white font-medium">{venue.booker_name}</span>
      </div>
    </div>
    
    <div className="mt-4 flex flex-wrap gap-1">
      {venue.genres.slice(0, 3).map((genre) => (
        <span 
          key={genre}
          className="px-2 py-1 text-xs rounded-full border"
          style={{
            background: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.8)'
          }}
        >
          {genre}
        </span>
      ))}
    </div>
  </GlassCard>
);

// Modal component
const CreateTaskModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        className="fixed inset-0 z-50 grid place-items-center p-6"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div 
          className="relative w-full max-w-2xl rounded-3xl border p-6 text-white backdrop-blur-2xl shadow-2xl"
          style={{
            background: THEME.cardBg,
            borderColor: 'rgba(255,255,255,0.15)'
          }}
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Create Task</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Task Type</label>
              <select className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur">
                <option className="bg-slate-900">Wide Research</option>
                <option className="bg-slate-900">Slides</option>
                <option className="bg-slate-900">Webpage</option>
                <option className="bg-slate-900">Video Generation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Notes / Instructions</label>
              <textarea 
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur placeholder:text-white/50 resize-none h-28"
                placeholder="Constraints, cities, budgets, etc."
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} className="border-white/20 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button className="bg-emerald-400/90 text-emerald-950 hover:bg-emerald-300">
                Create Task
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Map placeholder component
const MapPlaceholder: React.FC = () => (
  <GlassCard className="h-[420px] rounded-2xl overflow-hidden" hover={false}>
    <div className="relative h-full w-full">
      <div 
        className="absolute inset-0 bg-gradient-to-br opacity-30"
        style={{
          backgroundImage: `linear-gradient(135deg, ${THEME.primary}20, ${THEME.accent}20)`
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-white/60 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Interactive Venue Map</h3>
          <p className="text-white/70">Discover venues across San Francisco Bay Area</p>
        </div>
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white">
          <Plus className="h-4 w-4" />
        </Button>
        <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </GlassCard>
);

export const DeepBookingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div 
      className="min-h-screen relative"
      style={{ background: THEME.ink }}
    >
      {/* Glassmorphism background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{
            background: `linear-gradient(135deg, #22d3ee33, #f472b633)`
          }}
        />
        <div 
          className="absolute top-1/3 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30"
          style={{
            background: `linear-gradient(135deg, #10b98122, #38bdf822)`
          }}
        />
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 border-r backdrop-blur-xl" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white">DeepBooking</h1>
                <p className="text-xs text-white/60">Booking Platform</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      item.active 
                        ? 'bg-white/15 text-white' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-1.5 py-0.5"
                        style={{ 
                          background: item.badge === 'NEW' ? `${THEME.success}20` : `${THEME.accent}20`,
                          color: item.badge === 'NEW' ? THEME.success : THEME.accent
                        }}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="border-b backdrop-blur-xl p-6" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-2xl">
                <div className="flex items-center gap-3 rounded-2xl border p-3 backdrop-blur-xl" style={{ background: THEME.cardBg, borderColor: 'rgba(255,255,255,0.15)' }}>
                  <Search className="h-5 w-5 text-white/70" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="find venues in SF"
                    className="flex-1 bg-transparent border-0 text-white placeholder:text-white/60 focus-visible:ring-0"
                  />
                  <Button size="sm" className="bg-white/15 hover:bg-white/25 text-white/90">
                    Search Venues
                  </Button>
                  <Button size="sm" className="bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-100 border border-emerald-300/40">
                    <Sparkles className="h-4 w-4 mr-1" />
                    AI Recommender
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-6">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white/15 hover:bg-white/25 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 space-y-6 bg-white">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Venues', value: '1,247', icon: MapPin, color: THEME.primary },
                { label: 'Active Campaigns', value: '23', icon: Target, color: THEME.accent },
                { label: 'Pending Bookings', value: '8', icon: Clock, color: THEME.success },
                { label: 'Monthly Revenue', value: '$12.5K', icon: DollarSign, color: THEME.success }
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <GlassCard key={stat.label} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/70">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      </div>
                      <div 
                        className="p-2 rounded-lg"
                        style={{ background: `${stat.color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: stat.color }} />
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {/* Map */}
            <MapPlaceholder />

            {/* Venues grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recommended Venues</h2>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};