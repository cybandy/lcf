# Authorization Implementation Summary

## Completed: User and Gallery API Endpoint Protection

### User API Endpoints

All user API endpoints now have proper authorization checks:

#### 1. **User Account Deletion** (`/api/user/index.delete.ts`)
- **Authorization**: Self-service only
- **Rule**: Users can only delete their own account
- **Note**: Admin deletion of other users should be implemented as a separate endpoint if needed

#### 2. **User Profile Update** (`/api/user/index.patch.ts`)
- **Authorization**: Self-service only
- **Rule**: Users can only update their own profile (email, name, phone, etc.)
- **Note**: Admin updates of other users should be implemented as a separate endpoint if needed

#### 3. **User Profile Patch** (`/api/user/profile.patch.ts`)
- **Authorization**: Self-service only
- **Rule**: Users can only update their own profile fields (phone, address, bio, etc.)

#### 4. **Profile Picture Upload** (`/api/user/profile/picture-upload.put.ts`)
- **Authorization**: Self-service only (already implemented)
- **Rule**: Users can only upload their own avatar
- **Storage**: Files stored with userId prefix (`avatars/{userId}/`)

### Gallery API Endpoints

All gallery endpoints now have proper authorization:

#### 1. **Gallery List** (`/api/gallery/index.get.ts`)
- **Authorization**: Requires authentication
- **Rule**: Only authenticated users can view the gallery list
- **Returns**: All gallery images (currently no filtering by uploader)

#### 2. **Gallery Upload** (`/api/gallery/upload.ts`)
- **Authorization**: Requires authentication
- **Enhancement**: Now adds userId prefix for ownership tracking
- **Storage**: Files stored as `gallery/{userId}/{randomSuffix}`
- **Validation**: Max 8MB, image types only (jpeg, png, gif, heic, webp)

#### 3. **Gallery Image Delete** (`/api/gallery/[pathname].delete.ts`)
- **Authorization**: Permission-based + Ownership check
- **Rules**:
  1. Users with `MANAGE_POSTS` permission can delete any gallery image
  2. Users can delete their own uploaded images (files prefixed with their userId)
  3. All other users receive 403 Forbidden
- **Implementation**:
  ```typescript
  const hasManagePermission = hasFellowshipPermission(user, FellowshipPermission.MANAGE_POSTS);
  const isOwner = pathname.startsWith(`gallery/${userId}/`);
  
  if (!hasManagePermission && !isOwner) {
    throw 403 Forbidden
  }
  ```

## Authorization Patterns Used

### Pattern 1: Self-Service Only
Used for user profile operations:
```typescript
const session = await myRequireUserSession(event);
const userId = session.user.id;
// Only operate on this userId
```

### Pattern 2: Permission-Based OR Ownership
Used for gallery deletion:
```typescript
const user = await getUserWithRoles(event);
const hasPermission = hasFellowshipPermission(user, FellowshipPermission.MANAGE_POSTS);
const isOwner = resourceBelongsToUser(userId);

if (!hasPermission && !isOwner) {
  throw 403 Forbidden;
}
```

### Pattern 3: Simple Authentication
Used for viewing gallery:
```typescript
await requireUserSession(event);
// User just needs to be logged in
```

## File Ownership Tracking

### Implementation
- **Avatar uploads**: Stored as `avatars/{userId}/{randomSuffix}`
- **Gallery uploads**: Stored as `gallery/{userId}/{randomSuffix}`

This allows ownership checks by examining the file path prefix.

### Benefits
1. Easy to determine who uploaded a file
2. Can implement user-specific galleries
3. Can clean up user files on account deletion
4. Can implement quotas per user

## Security Considerations

### ✅ Implemented
- All endpoints require authentication
- Self-service operations are restricted to the authenticated user
- Gallery deletion checks both permission and ownership
- File uploads are validated for size and type
- User data is sanitized before returning to client

### 🔄 Future Enhancements
1. **Admin User Management**: Separate endpoints for admins to manage other users
2. **Gallery Filtering**: Filter gallery by uploader or albums
3. **File Quotas**: Limit storage per user
4. **Audit Logging**: Track who deletes what and when
5. **Soft Deletion**: Allow recovery of deleted images
6. **Album Permissions**: Group-level or per-album access control

## Testing Checklist

### User Endpoints
- [ ] User can delete their own account
- [ ] User cannot delete someone else's account
- [ ] User can update their own profile
- [ ] User cannot update someone else's profile
- [ ] User can upload their own avatar
- [ ] Avatar is stored with userId prefix

### Gallery Endpoints
- [ ] Only authenticated users can view gallery
- [ ] User can upload images to gallery
- [ ] Images are stored with userId prefix
- [ ] User can delete their own images
- [ ] User with MANAGE_POSTS can delete any image
- [ ] Regular user cannot delete others' images
- [ ] Get 403 error when unauthorized

## Next Steps

1. **Frontend Integration**: Update UI components to:
   - Show/hide delete buttons based on ownership or permissions
   - Display uploader information on gallery images
   - Show permission-based management options

2. **Additional Endpoints**: Consider creating:
   - Admin user management endpoints
   - Gallery filtering by uploader
   - Batch operations with permission checks

3. **Documentation**: Update API documentation with:
   - Authorization requirements for each endpoint
   - Permission levels needed
   - Error responses for unauthorized access
