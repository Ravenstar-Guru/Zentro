import { User, MatchResult, SectionedMatches } from '../types';
import { MIN_MATCH_PERCENTAGE, BEST_MATCH_THRESHOLD, COLLEGE_MATCH_THRESHOLD, AREA_MATCH_THRESHOLD } from '../utils/constants';

/**
 * Calculate match score between two users
 */
export function calculateMatchScore(userA: User, userB: User): number {
  let score = 0;

  // Geographic bonuses
  if (userA.college && userB.college && userA.college === userB.college) {
    score += 60;
  }

  if (userA.area && userB.area && userA.area === userB.area) {
    score += 40;
  }

  if (userA.city && userB.city && userA.city === userB.city) {
    score += 30;
  }

  // Skill matching: A teaches B
  const teachesMatches = userA.skillsHave.filter(skill =>
    userB.skillsWant.includes(skill)
  ).length;

  // Skill matching: B teaches A
  const learnsMatches = userB.skillsHave.filter(skill =>
    userA.skillsWant.includes(skill)
  ).length;

  const totalSkillMatches = teachesMatches + learnsMatches;
  score += totalSkillMatches * 20;

  // Calculate maximum possible skill matches
  // Each user's skillsHave can match with the other's skillsWant
  const maxSkillMatches = Math.min(userA.skillsHave.length, userB.skillsWant.length) +
                          Math.min(userB.skillsHave.length, userA.skillsWant.length);

  const maxPossible = 130 + maxSkillMatches * 20;

  if (maxPossible === 0) return 0;

  const percentage = Math.round((score / maxPossible) * 100);
  return Math.min(100, percentage);
}

/**
 * Find matches for a user, sorted by match percentage
 */
export function findMatches(
  currentUser: User,
  allUsers: User[],
  limit: number = 50
): MatchResult[] {
  return allUsers
    .filter(u => u.uid !== currentUser.uid)
    .map(u => ({
      ...u,
      matchPercentage: calculateMatchScore(currentUser, u)
    }))
    .filter(match => match.matchPercentage >= MIN_MATCH_PERCENTAGE)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, limit);
}

/**
 * Section matches into feed categories
 */
export function sectionMatches(matches: MatchResult[], currentUser: User): SectionedMatches {
  const bestMatches: MatchResult[] = [];
  const sameCollege: MatchResult[] = [];
  const nearby: MatchResult[] = [];
  const exploreMore: MatchResult[] = [];

  matches.forEach(match => {
    const isSameCollege = currentUser.college && match.college === currentUser.college;
    const isSameArea = currentUser.area && match.area === currentUser.area;

    if (match.matchPercentage >= 60) {
      bestMatches.push(match);
    } else if (isSameCollege && match.matchPercentage >= 40) {
      sameCollege.push(match);
    } else if (isSameArea && match.matchPercentage >= 30) {
      nearby.push(match);
    } else if (match.matchPercentage >= 25) {
      exploreMore.push(match);
    }
  });

  return {
    bestMatches: bestMatches.slice(0, 5),
    sameCollege: sameCollege.slice(0, 5),
    nearby: nearby.slice(0, 5),
    exploreMore: exploreMore.slice(0, 10)
  };
}

/**
 * Get all matches and section them
 */
export function getSectionsForUser(currentUser: User, allUsers: User[]): SectionedMatches {
  const allMatches = findMatches(currentUser, allUsers);
  return sectionMatches(allMatches, currentUser);
}
