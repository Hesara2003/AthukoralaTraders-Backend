# CORS Issue Fix Guide

## 🚨 Current Issue
**CORS Policy Error**: Backend server is blocking requests from the frontend domain.

```
Access to fetch at 'https://athukorala-traders-backend.onrender.com/api/products' 
from origin 'https://athukorala-traders-frontend.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## 🎯 Root Cause
The **Spring Boot backend** needs to be configured to allow requests from the Vercel frontend domain.

## 🛠️ Backend Solution (Required)

### 1. Update CORS Configuration in Backend

Add this to your Spring Boot backend (`CorsConfig.java` or similar):

```java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:5173",           // Development
                    "http://localhost:3000",           // Alternative dev port
                    "https://athukorala-traders-frontend.vercel.app", // Production
                    "https://*.vercel.app"             // All Vercel preview deployments
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 2. Alternative: Application Properties

Add to `application.properties` or `application.yml`:

```properties
# CORS Configuration
cors.allowed-origins=http://localhost:5173,https://athukorala-traders-frontend.vercel.app,https://*.vercel.app
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true
cors.max-age=3600
```

### 3. Controller-Level CORS (Quick Fix)

Add to your controllers:

```java
@CrossOrigin(origins = {
    "http://localhost:5173", 
    "https://athukorala-traders-frontend.vercel.app",
    "https://*.vercel.app"
})
@RestController
@RequestMapping("/api")
public class ProductController {
    // ... your endpoints
}
```

## 🔧 Frontend Workaround (Temporary)

The frontend now includes:
- ✅ **Mock data fallback**: If CORS fails, app uses local mock data
- ✅ **No-cors mode attempt**: Tries different fetch modes
- ✅ **Better error logging**: Shows exact CORS errors

## 🧪 Testing Backend CORS

1. **Test CORS directly**:
   ```bash
   curl -H "Origin: https://athukorala-traders-frontend.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://athukorala-traders-backend.onrender.com/api/products
   ```

2. **Expected response headers**:
   ```
   Access-Control-Allow-Origin: https://athukorala-traders-frontend.vercel.app
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```

## 🚀 Quick Backend Deploy Commands

If using the backend repository:

```bash
# 1. Add CORS configuration to backend
# 2. Commit changes
git add .
git commit -m "Add CORS configuration for Vercel frontend"
git push origin main

# 3. Render will auto-deploy the backend
```

## 📊 Status Verification

After backend CORS fix:
1. Visit: `https://athukorala-traders-frontend.vercel.app/api-debug`
2. Click "Run API Tests"
3. Should show: ✅ **products - 200** (instead of CORS error)

## 🎯 Expected Timeline

- **Backend CORS fix**: 5-10 minutes
- **Render deployment**: 2-3 minutes  
- **Frontend working**: Immediate after backend deploy

## 🆘 Emergency Contacts

- **Backend Repository**: `https://github.com/Hesara2003/AthukoralaTraders-Backend`
- **Render Dashboard**: `https://dashboard.render.com`
- **Frontend working with mock data**: Available immediately as fallback