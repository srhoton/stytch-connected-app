# Organization-Based Authentication Flow

## Overview
The authentication system has been updated to support dynamic organization selection, allowing users to:
- Authenticate without knowing their organization ID upfront
- Save their organization for future logins
- Switch between organizations as needed

## Key Features

### 1. Dynamic Organization Field
- The organization field is **hidden by default** if a previously used organization is stored in localStorage
- Users can click "Change" to enter a different organization
- The field appears automatically if:
  - No organization is stored
  - An authentication error related to organization occurs

### 2. Organization Persistence
- Successfully used organizations are saved in localStorage
- The saved organization is used for subsequent login attempts
- Users can override the saved organization at any time

### 3. Smart Error Handling
- If an organization is not found, the stored value is cleared
- Organization-specific error messages guide users
- The organization field appears automatically when needed

## How to Test

### First-Time Login
1. Clear your browser's localStorage (Developer Tools > Application > Local Storage)
2. Navigate to the login page at http://localhost:3002/
3. You'll see the Organization ID field by default
4. Enter:
   - Email: Your test user email
   - Password: Your test password
   - Organization ID: `acme-login` (or your organization's slug)
5. Click "Sign In"
6. The organization will be saved for future logins

### Subsequent Logins
1. Return to the login page
2. Notice the organization field is hidden, showing "Signing in to organization: **acme-login**"
3. Enter your email and password
4. Click "Sign In" - it will use the saved organization

### Changing Organizations
1. On the login page with a saved organization
2. Click the "Change" link next to the organization name
3. The organization field will appear
4. Enter a different organization ID
5. Complete the login

### Testing Error Cases
1. **Invalid Organization**: Enter an incorrect organization ID to see the error handling
2. **Wrong User/Org Combination**: Try logging in with an email that doesn't exist in the specified organization
3. **Password Reset**: The password reset flow uses the saved organization

## API Changes

### StytchService Updates
```typescript
// New functions added:
getStoredOrganization(): string | null
storeOrganization(slug: string): void
clearStoredOrganization(): void

// Updated signature:
authenticateWithPassword(credentials: LoginCredentials, organizationSlug?: string): Promise<StytchSession>
```

### LoginCredentials Type
```typescript
interface LoginCredentials {
  email: string;
  password: string;
  organization?: string; // New optional field
}
```

## Future Enhancements

### True Discovery Flow (Recommended for Production)
For production environments without hardcoded organizations, implement:

1. **Email-based Discovery**:
   - Send a discovery magic link to the user's email
   - User clicks the link to get an intermediate session token
   - Use the token to list available organizations
   - Let user select from their organizations
   - Complete authentication with the selected organization

2. **Organization Selection UI**:
   - If a user belongs to multiple organizations, show a dropdown/list
   - Allow user to select which organization to sign into
   - Remember their preference for future logins

3. **SSO Integration**:
   - For organizations with SSO enabled, redirect to their IdP
   - Handle SAML/OIDC flows appropriately

## Security Considerations

1. **Organization IDs are not sensitive**: They're similar to usernames
2. **localStorage is used for convenience**: Not for security
3. **Always validate on the backend**: Never trust client-side organization data

## Troubleshooting

### "Organization not found" Error
- Verify the organization slug is correct
- Check if the organization exists in your Stytch dashboard
- Ensure the user is a member of that organization

### Organization Field Not Appearing
- Check browser console for errors
- Verify localStorage is enabled in the browser
- Try manually clearing localStorage

### Session Issues
- The Stytch SDK handles session storage automatically
- Sessions are stored in cookies managed by the SDK
- Check cookie settings if sessions aren't persisting