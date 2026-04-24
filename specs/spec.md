# Functional Specification: Easy-Group

## Project Overview
Easy-Group is a team management platform that synchronizes with the CAMS Enrollment System. It allows administrators to create project frameworks for specific courses and enables students to form teams based on their actual course enrollments.

## User Roles

### 1. Super Admin
- **Authentication:** Username and Password.
- **Data Sync:** Fetches student and course data from CAMS API.
- **Project Creation:**
  - Selects a course from CAMS data.
  - Sets project title and description.
  - Defines group size (min/max members).
  - Specifies required submission fields (e.g., Project Name, Bio, GitHub link).
- **Project Locking:** Can lock/unlock a project. When locked, no new groups can be created, and existing groups cannot be modified (no info updates, no member changes).
- **Monitoring & Export:** 
  - Views all submitted groups, member lists, and their individual statuses.
  - Download Button: Generates a formatted Excel report for the project including all groups, member IDs, names, statuses, and project-specific attributes (Bio, links, etc.).
  - **Auto-Assignment Engine:** A powerful tool to handle students who failed to join a group manually.
- **System Cleanup:** A "Hard Reset" feature in the admin panel (protected by password) to wipe all data and start fresh for a new cycle.

### 2. Group Leader (Student)
- **Authentication:** Student Name + Student ID (verified against CAMS cache).
- **Project Access:** Can only see projects for courses they are enrolled in.
- **Group Management:**
  - Initiates a group for a specific project.
  - Fills in required attributes defined by the Admin.
  - **Edit Info:** Can update group details (Name, Bio, etc.) as long as the project is not locked.
  - **Member Management:** Invites members by searching Student ID and can remove members (pending or accepted) to manage the team.
- **Authority:** Acts as the primary contact and administrator for their specific group.

### 3. Group Member (Student)
- **Authentication:** Student Name + Student ID.
- **Notifications:** Receives invites from Group Leaders.
- **Action:** Can Accept or Decline invitations.
- **Visibility:** Once accepted, they can view their group structure in "My Groups".

## Core Logic & Rules

### Strict Membership Rule
- **One Group Per Project:** A student can belong to exactly one group per project. 
- **Acceptance Lock:** Once a student accepts an invitation, they are permanently assigned to that group for that project. They cannot accept other invites, and the system will block other leaders from sending them new requests.

### Project State Management
- **Active:** Open for group formation and modification.
- **Locked:** View-only state. No new invites, no member removals, and no attribute updates allowed.

### Synchronization
- Whenever the Admin dashboard or Student portal is accessed, the system fetches the latest enrollment data from CAMS via the `/api/sync` endpoints.

### Auto-Assignment Algorithm (Shuffle)
1. **Identify Leftovers:** Find all students enrolled in the project's course who are NOT in an "Accepted" group for this specific project.
2. **Fill Existing Slots:** Identify groups that have fewer than `maxMembers`. Distribute leftover students into these slots until either all slots are full or all students are assigned.
3. **Form New Groups:** If students remain, automatically create new groups of size `maxMembers`.
4. **Leader Assignment:** For each new group, the first assigned student is designated as the "Leader".
5. **Residual Handling:** If the final remaining students are fewer than `maxMembers`, they are placed into one final group.
6. **Preservation:** Existing "Accepted" memberships are NEVER modified or moved.
