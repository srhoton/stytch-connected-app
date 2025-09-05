# SSO Flow Test Plan

## Test 1: Fresh Login Flow
1. Clear all browser cookies and storage
2. Navigate to http://localhost:3000 (dest_app)
3. Expected: Should redirect to http://localhost:3001 with return_url parameter
4. Enter credentials and organization
5. Expected: After login, should redirect back to http://localhost:3000
6. Expected: Should see "Access Granted" page

## Test 2: Already Authenticated Flow  
1. Complete Test 1 first
2. Open a new tab and go to http://localhost:3000
3. Expected: Should immediately see "Access Granted" (no redirect)

## Test 3: Direct IDP Access While Authenticated
1. While authenticated, visit http://localhost:3001
2. Expected: Should see session details
3. Add ?return_url=http://localhost:3000 to the URL
4. Expected: Should immediately redirect to dest_app

## Test 4: Logout and Re-authenticate
1. While on IDP app, click "Logout"
2. Visit http://localhost:3000
3. Expected: Should redirect to login again

## Debug Console Commands

Check for Stytch cookies:
```javascript
document.cookie.split(';').filter(c => c.includes('stytch'))
```

Check session in dest_app console:
```javascript
const client = await window.stytchClient;
client.session.getSync()
```

## Known Issues Fixed
- Added cookie domain configuration to share sessions between localhost:3000 and localhost:3001
- Added delay to prevent race conditions in redirect logic
- Added logging to debug session validation