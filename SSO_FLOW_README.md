# SSO Flow Documentation

## Overview
This implementation provides a complete Single Sign-On (SSO) flow between two applications:
- **IDP App** (Identity Provider): Handles authentication (port 3001)
- **Dest App** (Destination/Protected App): Requires authentication (port 3000)

## How It Works

### Flow Diagram
```
1. User visits dest_app
   └── Not authenticated?
       └── Redirect to idp_app with return_url parameter
           └── User logs in at idp_app
               └── Authentication successful
                   └── Redirect back to dest_app
                       └── Session validated
                           └── Access granted!
```

### Detailed Flow

#### 1. **Unauthenticated User Flow**
When a user visits `dest_app` without a valid session:

1. The `ProtectedRoute` component checks for a valid Stytch session
2. If no session exists, it redirects to:
   ```
   http://localhost:3001?return_url=http%3A%2F%2Flocalhost%3A3000
   ```
3. The IDP app receives the `return_url` parameter
4. User enters credentials (email, password, organization)
5. Upon successful authentication:
   - Stytch sets session cookies (shared across apps)
   - Browser redirects to the `return_url`
6. Back at `dest_app`, the session is now valid
7. User sees the "Access Granted" page

#### 2. **Already Authenticated User Flow**
When a user with a valid session visits `dest_app`:

1. The `ProtectedRoute` component validates the session
2. Session is valid (cookies are shared)
3. User immediately sees the "Access Granted" page
4. No redirect to IDP app needed

#### 3. **Already Logged In at IDP**
If a user is already authenticated and visits the IDP app with a `return_url`:

1. The IDP app detects the valid session
2. Immediately redirects to the `return_url`
3. No login form is shown

## Security Features

### 1. **URL Validation**
The implementation includes protection against open redirect vulnerabilities:

```typescript
// urlValidator.ts
- Validates return URLs against a whitelist
- Only allows HTTP/HTTPS protocols
- Restricts to allowed domains
- Sanitizes and validates before redirecting
```

### 2. **Allowed Domains**
In development, the following domains are allowed:
- `localhost:3000`, `localhost:3001`, `localhost:3002`
- `127.0.0.1:3000`, `127.0.0.1:3001`, `127.0.0.1:3002`

In production, configure the allowed domains via environment variables.

### 3. **Session Storage**
- Return URLs are stored in `sessionStorage` (not `localStorage`)
- Cleared immediately after use
- Prevents persistence across browser sessions

## Configuration

### Environment Variables

#### dest_app/.env
```env
# IDP App URL for authentication redirects
VITE_IDP_APP_URL=http://localhost:3001

# Stytch Configuration (must match IDP app)
VITE_STYTCH_PROJECT_ID=your-project-id
VITE_STYTCH_PUBLIC_TOKEN=your-public-token
```

#### idp_app/.env
```env
# Default redirect URL after authentication
VITE_DEFAULT_REDIRECT_URL=http://localhost:3000

# Allowed redirect domains (comma-separated)
VITE_ALLOWED_REDIRECT_DOMAINS=localhost:3000,localhost:3001,localhost:3002

# Stytch Configuration
VITE_STYTCH_PROJECT_ID=your-project-id
VITE_STYTCH_PUBLIC_TOKEN=your-public-token
```

## Testing the SSO Flow

### Setup
1. Start both applications:
   ```bash
   # Terminal 1 - Dest App
   cd dest_app
   npm run dev  # Runs on port 3000
   
   # Terminal 2 - IDP App
   cd idp_app
   npm run dev  # Runs on port 3001
   ```

### Test Scenarios

#### Scenario 1: Fresh Login
1. Clear browser cookies/storage
2. Navigate to http://localhost:3000
3. You should be redirected to http://localhost:3001 with return_url
4. Enter credentials and organization
5. After login, you're redirected back to http://localhost:3000
6. You see the "Access Granted" page

#### Scenario 2: Already Authenticated
1. Complete Scenario 1 first
2. Open a new tab and go to http://localhost:3000
3. You should immediately see "Access Granted" (no redirect)

#### Scenario 3: Direct IDP Access While Authenticated
1. While authenticated, visit http://localhost:3001
2. You should see your session details
3. Add `?return_url=http://localhost:3000` to the URL
4. You should be immediately redirected to dest_app

#### Scenario 4: Logout and Re-authenticate
1. While on the IDP app session display, click "Logout"
2. Visit http://localhost:3000
3. You should be redirected to login again

## Key Components

### dest_app Components

#### ProtectedRoute.tsx
- Checks session validity
- Redirects to IDP if not authenticated
- Shows loading/error states appropriately

```typescript
const IDP_APP_URL = import.meta.env.VITE_IDP_APP_URL || 'http://localhost:3001';

useEffect(() => {
  if (!loading && !isValid && !error) {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${IDP_APP_URL}?return_url=${returnUrl}`;
  }
}, [loading, isValid, error]);
```

### idp_app Components

#### LoginPage.tsx
- Captures return_url from query params
- Stores in sessionStorage
- Redirects after successful login

```typescript
const returnUrl = searchParams.get('return_url');

useEffect(() => {
  if (returnUrl) {
    const validatedUrl = sanitizeReturnUrl(returnUrl);
    if (validatedUrl) {
      sessionStorage.setItem('auth_return_url', validatedUrl);
    }
  }
}, [returnUrl]);
```

#### App.tsx (AuthenticatedApp)
- Handles already-authenticated users
- Auto-redirects if return_url is present

```typescript
useEffect(() => {
  if (isAuthenticated && returnUrl) {
    const validatedUrl = sanitizeReturnUrl(returnUrl);
    if (validatedUrl) {
      window.location.href = validatedUrl;
    }
  }
}, [isAuthenticated, returnUrl]);
```

## Production Considerations

### 1. **Domain Configuration**
- Both apps must be on the same root domain for cookie sharing
- Example: `app.example.com` and `auth.example.com`
- Configure Stytch to recognize both subdomains

### 2. **HTTPS Required**
- Use HTTPS in production for security
- Stytch session cookies require secure context

### 3. **CORS Configuration**
- Configure CORS headers if apps are on different subdomains
- Allow credentials in CORS configuration

### 4. **Environment-Specific URLs**
- Use environment variables for all URLs
- Different configs for dev/staging/production

### 5. **Enhanced Security**
- Implement CSRF protection
- Use Content Security Policy headers
- Implement rate limiting on authentication endpoints
- Monitor for suspicious redirect patterns

### 6. **Session Management**
- Configure appropriate session timeout
- Implement session refresh logic
- Handle session expiry gracefully

## Troubleshooting

### Issue: Infinite Redirect Loop
**Cause**: Session validation failing repeatedly
**Solution**: 
- Check Stytch project configuration
- Ensure both apps use the same project ID
- Verify cookie domain settings

### Issue: Session Not Persisting
**Cause**: Cookies not being shared between apps
**Solution**:
- Ensure apps are on same domain (or configured subdomains)
- Check browser cookie settings
- Verify Stytch SDK initialization

### Issue: Return URL Not Working
**Cause**: URL validation failing
**Solution**:
- Check URL is properly encoded
- Verify domain is in allowed list
- Check browser console for validation errors

### Issue: "Organization not found" Error
**Cause**: Invalid or missing organization ID
**Solution**:
- Enter correct organization slug
- Check organization exists in Stytch dashboard
- Verify user is member of organization

## Best Practices

1. **Always validate return URLs** to prevent open redirect attacks
2. **Use HTTPS in production** for secure cookie transmission
3. **Implement proper error handling** for failed authentications
4. **Log authentication events** for security auditing
5. **Use environment variables** for configuration
6. **Test all flows** including edge cases
7. **Monitor session health** and implement appropriate timeouts
8. **Document organization IDs** for users
9. **Implement graceful fallbacks** for authentication failures
10. **Keep both apps' Stytch versions in sync**