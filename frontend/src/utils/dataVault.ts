import { StudentProfile } from '../types';
import { api } from '../api/client';

export interface UserVaultData {
  email: string;
  fullName?: string;
  profile?: Partial<StudentProfile>;
  target_career?: string;
  lastUpdated: number;
}

const VAULT_PREFIX = 'edupath_vault_';

export const getVaultKey = (email: string): string => {
  return `${VAULT_PREFIX}${email.trim().toLowerCase()}`;
};

export const getUserVault = (email: string): UserVaultData | null => {
  if (!email) return null;
  try {
    const raw = localStorage.getItem(getVaultKey(email));
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('[DataVault] Failed to read user vault:', err);
    return null;
  }
};

export const saveUserVault = (
  email: string,
  partial: Partial<UserVaultData>
): UserVaultData => {
  const cleanEmail = email.trim().toLowerCase();
  const existing = getUserVault(cleanEmail) || {
    email: cleanEmail,
    lastUpdated: Date.now()
  };

  const mergedProfile: Partial<StudentProfile> = {
    ...(existing.profile || {}),
    ...(partial.profile || {})
  };

  const updated: UserVaultData = {
    ...existing,
    ...partial,
    email: cleanEmail,
    lastUpdated: Date.now(),
    profile: mergedProfile
  };

  try {
    localStorage.setItem(getVaultKey(cleanEmail), JSON.stringify(updated));
  } catch (err) {
    console.warn('[DataVault] Failed to write user vault:', err);
  }
  return updated;
};

export const isProfileNonEmpty = (profile?: Partial<StudentProfile>): boolean => {
  if (!profile) return false;
  const hasSkills = Array.isArray(profile.technical_skills) && profile.technical_skills.length > 0;
  const hasProjects = Array.isArray(profile.projects) && profile.projects.length > 0;
  const hasCerts = Array.isArray(profile.certifications) && profile.certifications.length > 0;
  const hasDegree = Boolean(profile.degree && profile.degree.trim().length > 0);
  const hasMajor = Boolean(profile.major && profile.major.trim().length > 0);
  const hasGoals = Boolean(profile.career_goals && profile.career_goals.trim().length > 0);
  const hasTarget = Boolean(profile.target_career && profile.target_career.trim().length > 0);
  return hasSkills || hasProjects || hasCerts || hasDegree || hasMajor || hasGoals || hasTarget;
};

export const syncVaultToBackend = async (email: string): Promise<boolean> => {
  const cleanEmail = email.trim().toLowerCase();
  const vault = getUserVault(cleanEmail);
  if (!vault || !vault.profile || !isProfileNonEmpty(vault.profile)) {
    return false;
  }

  try {
    console.info(`[DataVault] Auto-syncing saved profile for ${cleanEmail} to backend...`);
    const p = vault.profile;
    await api.updateProfile({
      education_level: p.education_level || 'Undergraduate',
      degree: p.degree || '',
      major: p.major || '',
      graduation_year: Number(p.graduation_year || 2026),
      gpa: Number(p.gpa || 3.8),
      technical_skills: p.technical_skills || [],
      soft_skills: p.soft_skills || [],
      certifications: p.certifications || [],
      projects: p.projects || [],
      interests: p.interests || [],
      career_goals: p.career_goals || '',
      target_career: p.target_career || vault.target_career || ''
    });

    const target = vault.target_career || p.target_career;
    if (target) {
      try {
        await api.selectCareer(target);
      } catch {
        // non-fatal
      }
    }
    return true;
  } catch (err) {
    console.warn('[DataVault] Sync to backend failed (will retry on next action):', err);
    return false;
  }
};

export const exportVaultJson = (email: string): string => {
  const vault = getUserVault(email);
  return JSON.stringify(vault || {}, null, 2);
};

export const importVaultJson = (email: string, jsonStr: string): boolean => {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') {
      saveUserVault(email, parsed);
      return true;
    }
  } catch {
    // parse error
  }
  return false;
};
