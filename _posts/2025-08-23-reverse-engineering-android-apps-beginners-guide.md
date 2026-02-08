---
layout: post
title: "Reverse Engineering Android Apps: A Beginner's Guide"
date: 2025-08-23
categories: [Security, Android]
tags: [Reverse Engineering, Android, APK, Security]
---

Ever wondered how an Android app works under the hood? Here's how to peek inside, safely and legally, without bricking your device.

## Tools You'll Need

```bash
# Install tools
sudo apt-get install apktool
pip install frida-tools
```

## Step 1: Get the APK

```bash
# From device
adb pull /data/app/com.example.app/base.apk

# Or download from APKMirror, APKPure
```

## Step 2: Decompile

```bash
# Decompile APK
apktool d base.apk -o output/

# Output structure:
# output/
#   AndroidManifest.xml
#   res/          # Resources
#   smali/        # Decompiled code
```

### APK Structure 101

An APK is just a zip file:

1.  `classes.dex`: The compiled bytecode.
2.  `AndroidManifest.xml`: App metadata and permissions.
3.  `res/` and `resources.arsc`: UI assets and strings.
4.  `lib/`: Native libraries (`.so` files).

## Step 3: Analyze Code

### Convert to Java

```bash
# Use jadx for better readability
jadx base.apk -d output-java/

# Now you have .java files
```

Use JADX for readability, but keep apktool output around because it preserves resources and manifest details.

### Example Decompiled Code

```java
public class MainActivity extends AppCompatActivity {
    private String apiKey = "sk_live_abc123";  // Oops, hardcoded!
    
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // API call
        makeRequest("https://api.example.com/data");
    }
}
```

## Step 4: Dynamic Analysis with Frida

```javascript
// hook.js
Java.perform(function() {
    var MainActivity = Java.use("com.example.app.MainActivity");
    
    MainActivity.makeRequest.implementation = function(url) {
        console.log("API call to: " + url);
        return this.makeRequest(url);
    };
});
```

```bash
# Run Frida
frida -U -f com.example.app -l hook.js
```

## Bonus: Inspect the Manifest

The manifest tells you permissions, exported activities, and deep links:

```bash
apktool d base.apk -o output/
cat output/AndroidManifest.xml
```

Look for exported components or dangerous permissions like `READ_SMS`, `READ_CONTACTS`, or `WRITE_EXTERNAL_STORAGE`.

## Common Findings

### 1. Hardcoded Secrets
```java
// Bad practice
String apiKey = "sk_live_abc123";
String dbPassword = "admin123";
```

### 2. Insecure Network Calls
```java
// No certificate pinning
HttpURLConnection conn = (HttpURLConnection) url.openConnection();
```

### 2b. No TLS Validation

Custom `TrustManager` implementations that accept all certificates are a red flag.

### 3. Root Detection
```java
public boolean isRooted() {
    return new File("/system/app/Superuser.apk").exists();
}
```

## Bypassing Root Detection

```javascript
// Frida script
Java.perform(function() {
    var RootCheck = Java.use("com.example.app.RootCheck");
    RootCheck.isRooted.implementation = function() {
        console.log("Root check bypassed");
        return false;
    };
});
```

## Dynamic Traffic Analysis (Optional)

Use a proxy like mitmproxy or Burp Suite to observe API calls. This helps verify if data is encrypted or if sensitive information is sent in plaintext.

## Ethical Considerations

**Legal uses:**
- Security research on your own apps
- Malware analysis
- Learning

**Illegal uses:**
- Stealing proprietary code
- Bypassing licensing
- Distributing modified apps

## Protecting Your Apps

1. **ProGuard/R8:** Obfuscate code
2. **Certificate Pinning:** Prevent MITM
3. **Root Detection:** Multiple checks
4. **Encrypt Secrets:** Use Android Keystore
5. **Tamper Detection:** Verify APK signature
6. **Avoid hardcoded secrets**: Use backend-issued tokens instead

---

*Have you reverse engineered an app? What did you find?*
