# Google OAuth Backend Integration

This document outlines the backend changes needed to support Google OAuth authentication.

## Required Backend Changes

### 1. Add Google OAuth Dependencies (Java Spring Boot)

Add to `pom.xml`:
```xml
<dependency>
    <groupId>com.google.api-client</groupId>
    <artifactId>google-api-client</artifactId>
    <version>2.0.0</version>
</dependency>
<dependency>
    <groupId>com.google.oauth-client</groupId>
    <artifactId>google-oauth-client-jetty</artifactId>
    <version>1.34.1</version>
</dependency>
<dependency>
    <groupId>com.google.apis</groupId>
    <artifactId>google-api-services-oauth2</artifactId>
    <version>v2-rev20200213-2.0.0</version>
</dependency>
```

### 2. Create Google OAuth Controller Endpoint

Create `GoogleAuthController.java`:
```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class GoogleAuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtils jwtUtils;

    private static final String GOOGLE_CLIENT_ID = "your_google_client_id_here";

    @PostMapping("/google")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody GoogleAuthRequest request) {
        try {
            // Verify the Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), 
                new GsonFactory())
                .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String googleId = payload.getSubject();
                
                // Check if user exists or create new user
                User user = userService.findByEmail(email);
                
                if (user == null && "signup".equals(request.getType())) {
                    // Create new user for Google signup
                    user = new User();
                    user.setEmail(email);
                    user.setUsername(email); // Use email as username
                    user.setFullName(name);
                    user.setRole("CUSTOMER");
                    user.setGoogleAuth(true);
                    user.setGoogleId(googleId);
                    user.setProfileImage(request.getProfile().getImageUrl());
                    
                    user = userService.save(user);
                } else if (user == null && "signin".equals(request.getType())) {
                    throw new RuntimeException("No account found with this Google account");
                }
                
                // Generate JWT token
                String token = jwtUtils.generateToken(user.getUsername(), user.getRole());
                
                return ResponseEntity.ok(new GoogleAuthResponse(
                    token,
                    new UserResponse(
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole(),
                        user.getFullName(),
                        user.getProfileImage()
                    )
                ));
            } else {
                throw new RuntimeException("Invalid Google ID token");
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Google authentication failed: " + e.getMessage()));
        }
    }
}
```

### 3. Create Request/Response DTOs

Create `GoogleAuthRequest.java`:
```java
public class GoogleAuthRequest {
    private String idToken;
    private GoogleProfile profile;
    private String type; // "signin" or "signup"
    
    // getters and setters
}

public class GoogleProfile {
    private String id;
    private String name;
    private String email;
    private String imageUrl;
    
    // getters and setters
}
```

Create `GoogleAuthResponse.java`:
```java
public class GoogleAuthResponse {
    private String token;
    private UserResponse user;
    
    // constructors, getters and setters
}
```

### 4. Update User Entity

Add Google-specific fields to `User.java`:
```java
@Entity
public class User {
    // existing fields...
    
    @Column(name = "google_id")
    private String googleId;
    
    @Column(name = "is_google_auth")
    private Boolean isGoogleAuth = false;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Column(name = "profile_image")
    private String profileImage;
    
    // getters and setters
}
```

### 5. Update UserService

Add methods to `UserService.java`:
```java
public User findByEmail(String email) {
    return userRepository.findByEmail(email);
}

public User findByGoogleId(String googleId) {
    return userRepository.findByGoogleId(googleId);
}
```

### 6. Update UserRepository

Add methods to `UserRepository.java`:
```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    // existing methods...
}
```

### 7. Environment Variables

Add to `application.properties`:
```properties
google.oauth.client-id=your_google_client_id_here
google.oauth.client-secret=your_google_client_secret_here
```

## Frontend Integration

The frontend is already configured with:
- Google OAuth service (`src/services/googleAuth.js`)
- OAuth button component (`src/components/GoogleOAuthButton.jsx`)
- Updated Login and Signup pages with Google OAuth buttons
- Environment variables in `.env`

## Security Considerations

1. **Token Verification**: Always verify the Google ID token on the backend
2. **Client ID Validation**: Ensure the token was issued for your client ID
3. **User Data**: Only store necessary user information
4. **Rate Limiting**: Implement rate limiting on OAuth endpoints
5. **HTTPS**: Use HTTPS in production for all OAuth communications

## Testing

1. Ensure Google OAuth credentials are correctly configured
2. Test both signup and signin flows
3. Verify JWT token generation and validation
4. Test user creation and retrieval from database