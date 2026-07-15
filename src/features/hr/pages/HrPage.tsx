'use client';

import { FeaturePage, type SubModule } from '@/features/shared';
import { UserPlus, BookOpenCheck, CalendarClock, CalendarDays, Wallet, Award } from 'lucide-react';

const SUB_MODULES: SubModule[] = [
  { value: 'recruitment', label: 'Recruitment', icon: UserPlus, description: 'Requisitions, candidates & offers.' },
  { value: 'onboarding', label: 'Onboarding', icon: BookOpenCheck, description: 'Onboarding workflows & document collection.' },
  { value: 'attendance', label: 'Attendance', icon: CalendarClock, description: 'Attendance, shifts & time tracking.' },
  { value: 'leave', label: 'Leave', icon: CalendarDays, description: 'Leave policies, requests & accruals.' },
  { value: 'payroll', label: 'Payroll', icon: Wallet, description: 'Payroll runs, components & payslips.' },
  { value: 'performance', label: 'Performance', icon: Award, description: 'Goals, appraisals & LMS.' },
];

export function HrPage() {
  return (
    <FeaturePage
      module="hr"
      title="Human Resources"
      description="Recruitment, onboarding, attendance, leave, payroll & performance."
      subModules={SUB_MODULES}
    />
  );
}
