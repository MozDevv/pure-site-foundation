import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import {
  Trophy, Medal, Star, Flame, Target, Award, BookOpen, CheckCircle,
  TrendingUp, Crown, Zap, Sparkles, Shield, Gem,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

/* ── Types ── */
interface GamificationProfile {
  id: string;
  userName?: string;
  profilePicture?: string;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
}

interface BadgeDef {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  pointsReward: number;
}

interface UserBadge {
  id: string;
  badge: BadgeDef;
  earnedAt: string;
}

interface PointTransaction {
  id: string;
  action: string;
  points: number;
  description: string;
  createdAt: string;
}

/* ── Icon Map ── */
const BADGE_ICONS: Record<string, any> = {
  star: Star, book: BookOpen, check: CheckCircle, flame: Flame,
  trophy: Trophy, award: Award, sparkles: Sparkles, shield: Shield,
  gem: Gem, zap: Zap, target: Target, crown: Crown, medal: Medal,
  trending: TrendingUp,
};

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'bg-slate-500', UNCOMMON: 'bg-emerald-500', RARE: 'bg-blue-500',
  EPIC: 'bg-purple-500', LEGENDARY: 'bg-amber-500',
};

const RARITY_RING: Record<string, string> = {
  COMMON: 'ring-slate-300', UNCOMMON: 'ring-emerald-300', RARE: 'ring-blue-300',
  EPIC: 'ring-purple-300', LEGENDARY: 'ring-amber-400',
};

const CATEGORY_COLORS: Record<string, string> = {
  ACADEMIC: 'bg-blue-500', SOCIAL: 'bg-pink-500', INNOVATION: 'bg-purple-500',
  MENTORSHIP: 'bg-emerald-500', ATTENDANCE: 'bg-orange-500', STREAK: 'bg-red-500',
  SPECIAL: 'bg-amber-500',
};

/* ── Helpers ── */
function getLevelName(l: number) {
  if (l <= 2) return 'Beginner';
  if (l <= 4) return 'Intermediate';
  if (l <= 6) return 'Advanced';
  if (l <= 8) return 'Expert';
  return 'Master';
}

function getLevelProgress(pts: number) {
  const base = Math.floor(pts / 500) * 500;
  return Math.min(((pts - base) / 500) * 100, 100);
}

function nextLevelPts(pts: number) {
  return (Math.floor(pts / 500) + 1) * 500 - pts;
}

/* ── Component ── */
export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const { data: profile, isLoading: pLoading } = useQuery<GamificationProfile>({
    queryKey: ['gam-profile'],
    queryFn: async () => (await apiService.get(endpoints.getGamificationProfile)).data,
  });

  const { data: leaderboard = [], isLoading: lLoading } = useQuery<any[]>({
    queryKey: ['gam-leaderboard'],
    queryFn: async () => {
      const r = await apiService.get(endpoints.getLeaderboard);
      return r.data?.content || r.data || [];
    },
  });

  const { data: streakBoard = [] } = useQuery<any[]>({
    queryKey: ['gam-streaks'],
    queryFn: async () => {
      const r = await apiService.get(endpoints.getStreakLeaderboard);
      return r.data?.content || r.data || [];
    },
  });

  const { data: allBadges = [] } = useQuery<BadgeDef[]>({
    queryKey: ['gam-badges'],
    queryFn: async () => (await apiService.get(endpoints.getAllBadges)).data || [],
  });

  const { data: myBadges = [] } = useQuery<UserBadge[]>({
    queryKey: ['gam-my-badges'],
    queryFn: async () => (await apiService.get(endpoints.getMyBadges)).data || [],
  });

  const { data: pointHistory = [] } = useQuery<PointTransaction[]>({
    queryKey: ['gam-points'],
    queryFn: async () => {
      const r = await apiService.get(endpoints.getPointHistory);
      return r.data?.content || r.data || [];
    },
    enabled: activeTab === 'progress',
  });

  const seedMut = useMutation({
    mutationFn: () => apiService.post(endpoints.seedBadges, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gam-badges'] });
      toast.success('Default badges seeded!');
    },
  });

  const isLoading = pLoading || lLoading;
  const fullName = `${currentUser?.firstName} ${currentUser?.lastName}`;
  const myRank = leaderboard.findIndex((e: any) => e.userName === fullName) + 1;
  const top3 = leaderboard.slice(0, 3);
  const podiumColors = ['from-yellow-400 to-amber-500', 'from-slate-300 to-slate-400', 'from-amber-600 to-amber-700'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Leaderboard & Achievements
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track your progress and compete with peers</p>
        </div>
        {profile && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2 flex-wrap">
            {[
              { label: 'Rank', value: `#${myRank || '—'}` },
              { label: 'Points', value: profile.totalPoints },
              { label: 'Level', value: profile.level },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                {i > 0 && <div className="w-px h-8 bg-border" />}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-semibold text-primary">{s.value}</p>
                </div>
              </div>
            ))}
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-xl font-semibold text-orange-500 flex items-center gap-1">
                <Flame className="h-4 w-4" />{profile.currentStreak}d
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Podium — Top 3 */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {[1, 0, 2].map((idx, pos) => {
            const e = top3[idx];
            const rank = idx + 1;
            const isChamp = rank === 1;
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pos * 0.1 }} className={isChamp ? '' : rank === 2 ? 'mt-8' : 'mt-12'}>
                <Card className={isChamp ? 'border-yellow-300 shadow-lg' : ''}>
                  <CardContent className="p-3 md:p-4 text-center">
                    <div className={`${isChamp ? 'w-12 h-12 md:w-14 md:h-14' : 'w-10 h-10 md:w-12 md:h-12'} rounded-full bg-gradient-to-br ${podiumColors[idx]} mx-auto flex items-center justify-center mb-2`}>
                      {isChamp ? <Crown className="h-6 w-6 text-white" /> : <Medal className="h-5 w-5 text-white" />}
                    </div>
                    <Avatar className={`${isChamp ? 'h-16 w-16 md:h-20 md:w-20 ring-4 ring-yellow-400' : 'h-12 w-12 md:h-16 md:w-16 ring-2 ring-slate-300'} mx-auto mb-2`}>
                      <AvatarImage src={e.profilePicture} />
                      <AvatarFallback className={`${isChamp ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-bold text-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold'}`}>
                        {e.userName?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold truncate">{e.userName}</p>
                    <p className={`font-semibold ${isChamp ? 'text-lg text-yellow-600' : 'text-sm text-muted-foreground'}`}>
                      {e.totalPoints} pts
                    </p>
                    {isChamp ? (
                      <Badge className="mt-2 bg-yellow-500 text-white">Champion</Badge>
                    ) : (
                      <Badge variant="outline" className="mt-2">{rank === 2 ? '2nd' : '3rd'} Place</Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-lg">
          <TabsTrigger value="leaderboard">Rankings</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Rankings */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Points Leaderboard</CardTitle>
              <CardDescription>Top performers based on total points earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {leaderboard.slice(0, 25).map((entry: any, i: number) => {
                  const isMe = entry.userName === fullName;
                  const rank = i + 1;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-lg transition-colors ${isMe ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'}`}>
                      <div className="w-8 text-center shrink-0">
                        {rank <= 3 ? (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-slate-400' : 'bg-amber-600'}`}>{rank}</div>
                        ) : (
                          <span className="text-sm font-semibold text-muted-foreground">{rank}</span>
                        )}
                      </div>
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
                        <AvatarImage src={entry.profilePicture} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{entry.userName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.userName}{isMe && <Badge variant="outline" className="ml-2 text-[10px]">You</Badge>}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Lv {entry.level} · {getLevelName(entry.level)}</span>
                          <span className="hidden sm:flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" />{entry.currentStreak}d</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{entry.totalPoints}</p>
                        <p className="text-[10px] text-muted-foreground">pts</p>
                      </div>
                    </motion.div>
                  );
                })}
                {leaderboard.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No leaderboard data yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Streaks */}
        <TabsContent value="streaks" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" /> Streak Leaderboard
              </CardTitle>
              <CardDescription>Most consistent learners by daily streaks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {streakBoard.slice(0, 25).map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                    <span className="w-8 text-center text-sm font-semibold text-muted-foreground">{i + 1}</span>
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={e.profilePicture} />
                      <AvatarFallback className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs">{e.userName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{e.userName}</p>
                      <p className="text-xs text-muted-foreground">Best: {e.longestStreak}d</p>
                    </div>
                    <div className="flex items-center gap-1 text-orange-500 font-semibold">
                      <Flame className="h-4 w-4" />{e.currentStreak}d
                    </div>
                  </div>
                ))}
                {streakBoard.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground"><Flame className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No streak data yet</p></div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" /> Badges Collection
                  </CardTitle>
                  <CardDescription>{myBadges.length} of {allBadges.length} earned</CardDescription>
                </div>
                {['Admin', 'Super_Admin'].includes(currentUser?.role) && allBadges.length === 0 && (
                  <Button size="sm" variant="outline" onClick={() => seedMut.mutate()} disabled={seedMut.isPending}>
                    <Sparkles className="h-4 w-4 mr-1" /> Seed Badges
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allBadges.map(b => {
                  const Icon = BADGE_ICONS[b.icon] || Star;
                  const earned = myBadges.some(ub => ub.badge?.id === b.id);
                  return (
                    <motion.div key={b.id} whileHover={{ scale: 1.02 }}
                      className={`border rounded-xl p-4 text-center transition-all ${earned ? `border-primary/30 bg-primary/5 ring-2 ${RARITY_RING[b.rarity] || ''}` : 'opacity-60 grayscale'}`}>
                      <div className={`w-14 h-14 rounded-full ${CATEGORY_COLORS[b.category] || 'bg-slate-500'} mx-auto flex items-center justify-center mb-3`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <p className="text-sm font-semibold">{b.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <Badge className={`text-[10px] ${RARITY_COLORS[b.rarity] || 'bg-slate-500'} text-white`}>{b.rarity}</Badge>
                        <Badge variant="outline" className="text-[10px]">+{b.pointsReward}</Badge>
                      </div>
                      {earned ? <Badge className="mt-2 bg-emerald-500 text-white">Earned</Badge> : <Badge variant="outline" className="mt-2">Locked</Badge>}
                    </motion.div>
                  );
                })}
              </div>
              {allBadges.length === 0 && (
                <div className="text-center py-12 text-muted-foreground"><Award className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No badges available yet</p></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress */}
        <TabsContent value="progress" className="space-y-4">
          {profile ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" /> Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold">Level {profile.level} — {getLevelName(profile.level)}</p>
                        <p className="text-xs text-muted-foreground">{nextLevelPts(profile.totalPoints)} pts to next level</p>
                      </div>
                      <Badge className="bg-primary text-primary-foreground"><Zap className="h-3 w-3 mr-1" />{profile.totalPoints} pts</Badge>
                    </div>
                    <Progress value={getLevelProgress(profile.totalPoints)} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Target, color: 'text-primary', value: myRank || '—', label: 'Rank' },
                      { icon: Flame, color: 'text-orange-500', value: profile.currentStreak, label: 'Day Streak' },
                      { icon: Trophy, color: 'text-amber-500', value: profile.longestStreak, label: 'Best Streak' },
                      { icon: Award, color: 'text-blue-500', value: myBadges.length, label: 'Badges' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-4 bg-muted/50 rounded-xl">
                        <s.icon className={`h-8 w-8 ${s.color} mx-auto mb-2`} />
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  <CardDescription>Points earned from platform activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pointHistory.slice(0, 20).map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Zap className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{tx.action.replace(/_/g, ' ')} · {new Date(tx.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500 text-white">+{tx.points}</Badge>
                      </div>
                    ))}
                    {pointHistory.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground"><Zap className="h-10 w-10 mx-auto mb-2 opacity-50" /><p className="text-sm">No activity yet</p></div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {myBadges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Your Badges</CardTitle>
                    <CardDescription>{myBadges.length} earned</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {myBadges.map(ub => {
                        const Icon = BADGE_ICONS[ub.badge?.icon] || Star;
                        return (
                          <div key={ub.id} className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-full px-3 py-1.5">
                            <div className={`w-6 h-6 rounded-full ${CATEGORY_COLORS[ub.badge?.category] || 'bg-slate-500'} flex items-center justify-center`}>
                              <Icon className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm font-medium">{ub.badge?.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-semibold text-muted-foreground">No progress data available yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start completing courses and assignments to earn points</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
