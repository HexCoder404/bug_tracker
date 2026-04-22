export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  createdAt: string;
}

export type BugPriority = 'low' | 'medium' | 'high' | 'critical';
export type BugStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface Comment {
  id: string;
  bugId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface Bug {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  priority: BugPriority;
  status: BugStatus;
  assignee: string;
  reporter: string;
  reporterName: string;
  tags: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  memberIds: string[];
  inviteCode: string;
  createdAt: string;
  color: string; // accent color class
}
