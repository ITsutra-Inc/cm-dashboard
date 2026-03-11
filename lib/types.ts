export interface Manager {
  id: string
  name: string
  color: string
  colorClass: string
  glassClass: string
  candidates: Candidate[]
}

export interface Candidate {
  name: string
  managerId: string
}

export interface Interview {
  id: string
  candidateName: string
  companyName: string
  stage: 'Screening' | 'Initial' | 'Final'
  date: string
  status: string
  managerId: string
  managerName: string
  accountType?: string
  isEndClient?: boolean
}

export interface Hire {
  id: string
  candidateName: string
  clientName: string
  endClientName: string
  hiredDate: string
  managerId: string
  managerName: string
  isEndClient: boolean
  points: number
}

export interface Company {
  id: string
  name: string
  city: string
  industry: string
  phone: string
  website: string
  email: string
  interviewCount: number
}

export interface ManagerStats {
  managerId: string
  managerName: string
  color: string
  totalInterviews: number
  screening: number
  initial: number
  final: number
  conversionRate: number
  candidates: string[]
}

export interface DashboardData {
  interviews: Interview[]
  companies: Company[]
  managerStats: ManagerStats[]
  lastUpdated: string
  d365Connected: boolean
  entityInfo?: {
    interviewEntity: string | null
    availableEntities: string[]
  }
}
