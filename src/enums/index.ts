export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum RoleCode {
  USER = 'user',
  LAWYER = 'lawyer',
  ADMIN = 'admin',
}

export enum UserRoleStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive',
  REJECTED = 'rejected',
}

export enum LawyerVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum CaseStatus {
  NEW = 'new',
  UNDER_REVIEW = 'under_review',
  LAWYER_ASSIGNED = 'lawyer_assigned',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

export enum AssetType {
  IMAGE = 'image',
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  OTHER = 'other',
  PNG = 'png',
}

export enum CaseNoteType {
  ADMIN = 'admin',
  LAWYER = 'lawyer',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

