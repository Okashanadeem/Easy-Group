# Technical Implementation Detail

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** MongoDB via Mongoose
- **Styling:** Tailwind CSS 4.0
- **Verification:** Zod
- **Authentication:** Custom JWT-based sessions

## Database Schema Designs

### Project Schema
```typescript
{
  courseCode: string,      // e.g. "CS301"
  courseTitle: string,     // e.g. "Software Engineering"
  title: string,
  description: string,
  minMembers: number,
  maxMembers: number,
  requiredFields: string[], // ["Bio", "GitHub", "Live URL"]
  deadline: Date,
  isActive: boolean,
  isLocked: boolean        // Controls project-wide modifications
}
```

## Reporting & Exports
- **Library:** `xlsx` or `exceljs`.
- **Logic:** Server-side route that aggregates `Group` data for a specific `projectId`, joins with `members` data, and converts the JSON tree into a flat spreadsheet format for easy grading and administration.

## System Maintenance
- **Endpoint:** `POST /api/admin/system/reset`
- **Security:** Requires `adminPassword` in body + active admin session.
- **Action:** Drops all `Projects`, `Groups`, and `Notifications` collections to prepare the system for a fresh academic semester.

### Group Schema
```typescript
{
  projectId: ObjectId,
  groupName: string,
  leaderId: string,        // Student ID
  members: [{
    studentId: string,
    name: string,
    status: "Pending" | "Accepted" | "Declined",
    joinedAt: Date
  }],
  attributes: Map<string, string>, // Dynamic data based on Project.requiredFields
  isSubmitted: boolean
}
```

### Notification Schema
```typescript
{
  recipientId: string,     // Student ID
  senderId: string,        // Leader Student ID
  groupId: ObjectId,
  projectId: ObjectId,
  type: "INVITE",
  status: "UNREAD" | "READ" | "RESPONDED"
}
```

## API Integration Strategy (CAMS Connect)

### The Sync Hook
A utility function `syncWithCams()` will be triggered:
1. When Admin clicks "Force Sync" in dashboard.
2. Periodically via background job (optional).
3. On first login of a new student session if their ID isn't in cache.
## API Integration Strategy (CAMS Connect)
...
### Fetch Logic
```typescript
async function syncWithCams() {
  const headers = { 'x-api-key': process.env.CAMS_SYNC_KEY };

  // 1. Fetch Registrations
  const regRes = await fetch(`${CAMS_URL}/api/sync/registrations`, { headers });
  const students = await regRes.json();

  // 2. Fetch Courses
  const courseRes = await fetch(`${CAMS_URL}/api/sync/courses`, { headers });
  const courses = await courseRes.json();

  // 3. Upsert into local CamsCache collection
}
```

## Phase 7: Auto-Assignment Implementation
- **Endpoint:** `POST /api/projects/[id]/auto-assign`
- **Algorithm Strategy:**
  1. Fetch `CamsStudent.find({ "enrolledCourses.courseCode": project.courseCode })`.
  2. Fetch all `Group.find({ projectId: project._id })`.
  3. Filter out students already in `members.status === "Accepted"`.
  4. Iterate through leftover students:
     - First, target existing groups where `members.length < project.maxMembers`.
     - Then, chunk remaining students into groups of size `project.maxMembers`.
     - For new groups, use a default naming convention (e.g., "Auto-Group-X").
  5. Bulk write updates/creates to MongoDB.

## Security Implementation
- **Admin Access:** Middleware will check for `admin_session` cookie/header.
- **Student Access:** Middleware will verify the `student_id` in the session matches the `studentId` from the verified CAMS cache.
- **Data Isolation:** All queries for projects/groups will automatically include filters for `studentId` or `courseCode` to ensure students only see their relevant data.
