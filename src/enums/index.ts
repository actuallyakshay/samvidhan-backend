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

/** Case thread chat: who sent / whose read cursor (no per-user joins in the UI). */
export enum CaseMessageParticipantKind {
  USER = 'user',
  LAWYER = 'lawyer',
  ADMIN = 'admin',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

/** Mirrors Razorpay subscription `status` strings. */
export enum RazorpaySubscriptionStatus {
  CREATED = 'created',
  AUTHENTICATED = 'authenticated',
  ACTIVE = 'active',
  PENDING = 'pending',
  HALTED = 'halted',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}
