# 🚀 OVH VPS MongoDB Atlas Deployment Guide

## 📋 Common MongoDB Atlas Connection Issues on OVH VPS

### 1. **IP Whitelist Problem** (Most Common)
OVH VPS often have dynamic or restricted IP addresses that aren't whitelisted in MongoDB Atlas.

**Solution:**
1. Get your VPS IP address:
   ```bash
   curl ifconfig.me
   # or
   curl ipinfo.io/ip
   ```


2. Add the IP to MongoDB Atlas:
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Add your VPS IP: `YOUR_VPS_IP/32`
   - Or use `0.0.0.0/0` for testing (NOT recommended for production)

### 2. **Network Restrictions**
OVH VPS may block outbound connections to certain ports.

**Solution:**
```bash
# Test connectivity
telnet shareprinto.c912w9w.mongodb.net 27017
# or
nc -zv shareprinto.c912w9w.mongodb.net 27017
```

### 3. **DNS Resolution Issues**
Some VPS providers have DNS issues with SRV records.

**Solution:**
Use direct connection string instead of SRV:
```properties
# Instead of SRV:
# mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@shareprinto.c912w9w.mongodb.net/...

# Use direct connection:
# Replace YOUR_USERNAME and YOUR_PASSWORD with your MongoDB Atlas credentials
mongodb://YOUR_USERNAME:YOUR_PASSWORD@shareprinto-shard-00-00.c912w9w.mongodb.net:27017,shareprinto-shard-00-01.c912w9w.mongodb.net:27017,shareprinto-shard-00-02.c912w9w.mongodb.net:27017/shareprinto?ssl=true&replicaSet=atlas-123456-shard-0&authSource=admin&retryWrites=true&w=majority
```

## 🔧 Step-by-Step VPS Deployment

### Step 1: Prepare Your VPS
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 17
sudo apt install openjdk-17-jdk -y

# Install MongoDB tools (optional, for testing)
sudo apt install mongodb-clients -y

# Install curl for testing
sudo apt install curl -y
```

### Step 2: Get Your VPS IP
```bash
# Get your VPS public IP
VPS_IP=$(curl -s ifconfig.me)
echo "Your VPS IP: $VPS_IP"
```

### Step 3: Configure MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to "Network Access"
3. Click "Add IP Address"
4. Add your VPS IP: `YOUR_VPS_IP/32`
5. Save changes

### Step 4: Test Connection
```bash
# Test basic connectivity
curl -s --connect-timeout 10 https://shareprinto.c912w9w.mongodb.net/

# Test with mongosh (if installed)
# Replace YOUR_USERNAME and YOUR_PASSWORD with your MongoDB Atlas credentials
mongosh "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@shareprinto.c912w9w.mongodb.net/?retryWrites=true&w=majority&appName=shareprinto" --eval "db.adminCommand('ping')"
```

### Step 5: Deploy Your Application
```bash
# Build the application
cd /path/to/shareprinto-authentification-backend
./gradlew build

# Run with VPS profile
java -jar -Dspring.profiles.active=vps build/libs/shareprinto-authentification-backend-*.jar

# Or run directly with Gradle
./gradlew bootRun --args='--spring.profiles.active=vps'
```

## 🛠️ Alternative Connection Strings

If the default SRV connection fails, try these alternatives in your `application-vps.properties`:

### Option 1: Direct Connection
```properties
# Replace YOUR_USERNAME and YOUR_PASSWORD with your MongoDB Atlas credentials
spring.data.mongodb.uri=mongodb://YOUR_USERNAME:YOUR_PASSWORD@shareprinto-shard-00-00.c912w9w.mongodb.net:27017,shareprinto-shard-00-01.c912w9w.mongodb.net:27017,shareprinto-shard-00-02.c912w9w.mongodb.net:27017/shareprinto?ssl=true&replicaSet=atlas-123456-shard-0&authSource=admin&retryWrites=true&w=majority
```

### Option 2: With Explicit SSL
```properties
# Replace YOUR_USERNAME and YOUR_PASSWORD with your MongoDB Atlas credentials
spring.data.mongodb.uri=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@shareprinto.c912w9w.mongodb.net/?retryWrites=true&w=majority&appName=shareprinto&ssl=true&authSource=admin
```

### Option 3: With Connection Pool Settings
```properties
# Replace YOUR_USERNAME and YOUR_PASSWORD with your MongoDB Atlas credentials
spring.data.mongodb.uri=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@shareprinto.c912w9w.mongodb.net/?retryWrites=true&w=majority&appName=shareprinto&maxPoolSize=20&minPoolSize=5&maxIdleTimeMS=300000&connectTimeoutMS=30000&socketTimeoutMS=60000
```

## 🔍 Troubleshooting Commands

### Check Network Connectivity
```bash
# Test DNS resolution
nslookup shareprinto.c912w9w.mongodb.net

# Test port connectivity
telnet shareprinto.c912w9w.mongodb.net 27017

# Test HTTPS connectivity
curl -I https://shareprinto.c912w9w.mongodb.net/
```

### Check Firewall
```bash
# Check UFW status
sudo ufw status

# Check iptables
sudo iptables -L

# Check if port 27017 is blocked
sudo netstat -tulpn | grep 27017
```

### Test MongoDB Connection
```bash
# Test with mongosh
# Replace YOUR_USERNAME and YOUR_PASSWORD with your MongoDB Atlas credentials
mongosh "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@shareprinto.c912w9w.mongodb.net/?retryWrites=true&w=majority&appName=shareprinto" --eval "db.adminCommand('ping')"

# Test with mongo (older version)
# Replace YOUR_USERNAME and YOUR_PASSWORD with your MongoDB Atlas credentials
mongo "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@shareprinto.c912w9w.mongodb.net/?retryWrites=true&w=majority&appName=shareprinto" --eval "db.adminCommand('ping')"
```

## 🚨 Common Error Messages and Solutions

### Error: "Connection refused"
**Cause:** IP not whitelisted or network blocked
**Solution:** Add VPS IP to MongoDB Atlas whitelist

### Error: "Authentication failed"
**Cause:** Wrong credentials or database name
**Solution:** Verify username/password in connection string

### Error: "SSL handshake failed"
**Cause:** SSL/TLS issues
**Solution:** Try connection string with `ssl=true` parameter

### Error: "DNS resolution failed"
**Cause:** SRV record resolution issues
**Solution:** Use direct connection string instead of SRV

### Error: "Connection timeout"
**Cause:** Network latency or firewall blocking
**Solution:** Increase timeout values in connection string

## 📊 Monitoring and Logs

### Enable Debug Logging
Add to your `application-vps.properties`:
```properties
logging.level.org.mongodb.driver=DEBUG
logging.level.org.springframework.data.mongodb=DEBUG
logging.level.com.starboy99.shareprintoauthentificationbackend=DEBUG
```

### Health Check Endpoints
Once running, test these endpoints:
```bash
# Basic health check
curl http://your-vps-ip:3000/health

# Database health check
curl http://your-vps-ip:3000/health/db

# MongoDB-specific health check
curl http://your-vps-ip:3000/health/mongo
```

## 🔐 Security Considerations

1. **Never use `0.0.0.0/0` in production** - Always whitelist specific IPs
2. **Use environment variables** for sensitive data:
   ```bash
   # Replace YOUR_USERNAME and YOUR_PASSWORD with your MongoDB Atlas credentials
   export MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@shareprinto.c912w9w.mongodb.net/?retryWrites=true&w=majority&appName=shareprinto"
   export JWT_SECRET="your-secret-key"
   ```
3. **Enable SSL/TLS** in all connection strings
4. **Use strong passwords** and rotate them regularly

## 📞 Support

If you're still having issues:
1. Run the troubleshooting script: `./vps-mongodb-troubleshooting.sh`
2. Check MongoDB Atlas logs in the dashboard
3. Verify your VPS provider's network policies
4. Contact OVH support if network issues persist

---

**Remember:** The most common issue is IP whitelisting. Make sure your VPS IP is added to MongoDB Atlas Network Access list!



