import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Play, 
  Eye, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

interface ContentCalendarProps {
  musicItemId: string;
}

interface ContentItem {
  id: string;
  day: string;
  script: string;
  caption: string;
  hashtags: string[];
  cta: string;
  status: string;
  angle_id: string;
  angle?: {
    hook: string;
    duration_hint: string;
    difficulty: number;
    sound_fit: number;
  };
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({ musicItemId }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContentCalendar();
  }, [musicItemId, currentWeek]);

  const loadContentCalendar = async () => {
    try {
      setLoading(true);
      const startDate = startOfWeek(currentWeek);
      const endDate = addDays(startDate, 6);

      const { data, error } = await supabase
        .from('content_queue')
        .select(`
          *,
          angle:angle_bank (
            hook,
            duration_hint,
            difficulty,
            sound_fit
          )
        `)
        .eq('music_item_id', musicItemId)
        .gte('day', format(startDate, 'yyyy-MM-dd'))
        .lte('day', format(endDate, 'yyyy-MM-dd'))
        .order('day');

      if (error) throw error;
      setContentItems(data || []);
    } catch (error) {
      console.error('Error loading content calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(currentWeek), i)
  );

  const getContentForDay = (day: Date) => {
    return contentItems.filter(item => 
      isSameDay(new Date(item.day), day)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'drafted': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'published': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'archived': return 'bg-muted/10 text-muted-foreground border-border';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-500';
    if (difficulty <= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSoundFitColor = (soundFit: number) => {
    if (soundFit >= 80) return 'text-green-500';
    if (soundFit >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Content Calendar
              </CardTitle>
              <CardDescription>
                7-day content schedule with performance insights
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayContent = getContentForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <Card 
              key={index}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isToday ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedDay(day)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">
                      {format(day, 'EEE')}
                    </h3>
                    <div className={`text-lg font-bold ${
                      isToday ? 'text-primary' : 'text-foreground'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  {dayContent.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {dayContent.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {dayContent.slice(0, 2).map((item, idx) => (
                    <div 
                      key={item.id}
                      className="p-2 rounded-md bg-muted/30 border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </Badge>
                        {item.angle?.duration_hint && (
                          <span className="text-xs text-muted-foreground">
                            {item.angle.duration_hint}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground truncate">
                        {item.angle?.hook || 'Content hook'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.angle?.difficulty && (
                          <span className={`text-xs ${getDifficultyColor(item.angle.difficulty)}`}>
                            L{item.angle.difficulty}
                          </span>
                        )}
                        {item.angle?.sound_fit && (
                          <span className={`text-xs ${getSoundFitColor(item.angle.sound_fit)}`}>
                            {item.angle.sound_fit}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {dayContent.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{dayContent.length - 2} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
            <CardDescription>
              {getContentForDay(selectedDay).length} content pieces scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {getContentForDay(selectedDay).map((item) => (
                <Card key={item.id} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(item.status)}
                        >
                          {item.status}
                        </Badge>
                        {item.angle?.duration_hint && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.angle.duration_hint}
                          </Badge>
                        )}
                        {item.angle?.difficulty && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getDifficultyColor(item.angle.difficulty)}`}
                          >
                            Level {item.angle.difficulty}
                          </Badge>
                        )}
                        {item.angle?.sound_fit && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSoundFitColor(item.angle.sound_fit)}`}
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {item.angle.sound_fit}% fit
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-1">Hook</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.angle?.hook || 'Content hook'}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-1">Caption</h4>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.caption}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-1">Hashtags</h4>
                        <div className="flex flex-wrap gap-1">
                          {item.hashtags?.slice(0, 8).map((tag, idx) => (
                            <span 
                              key={idx}
                              className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {item.hashtags?.length > 8 && (
                            <span className="text-xs text-muted-foreground">
                              +{item.hashtags.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-1">Call to Action</h4>
                        <p className="text-sm text-primary">{item.cta}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Generate Video
                        </Button>
                        <div className="flex-1" />
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            0
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            0
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            0
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Week Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{contentItems.length}</div>
              <div className="text-sm text-muted-foreground">Total Content</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {contentItems.filter(item => item.status === 'ready').length}
              </div>
              <div className="text-sm text-muted-foreground">Ready to Publish</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {contentItems.filter(item => item.status === 'drafted').length}
              </div>
              <div className="text-sm text-muted-foreground">In Production</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {contentItems.filter(item => item.status === 'published').length}
              </div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};