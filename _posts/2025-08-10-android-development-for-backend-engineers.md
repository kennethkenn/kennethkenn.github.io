---
layout: post
title: "Android Development for Backend Engineers"
date: 2025-08-10
categories: [Mobile, Android]
tags: [Android, Kotlin, Java, Mobile Development]
---

As a backend engineer comfortable with Java and Spring Boot, Android development feels both familiar and alien. The language is the same, but the paradigms are different. Here's what I wish I knew when I started.

## The Mental Model Shift

**Backend:** Request → Process → Response
**Android:** User Action → UI Update → Background Task → UI Update

Everything revolves around the **Activity Lifecycle** and **UI Thread**.

## The Activity Lifecycle

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        // Initialize UI, set up listeners
    }
    
    override fun onStart() {
        super.onStart()
        // Activity becoming visible
    }
    
    override fun onResume() {
        super.onResume()
        // Activity in foreground, user can interact
    }
    
    override fun onPause() {
        super.onPause()
        // Activity losing focus (e.g., phone call)
    }
    
    override fun onStop() {
        super.onStop()
        // Activity no longer visible
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // Activity being destroyed, cleanup resources
    }
}
```

**Key Insight:** Android can kill your app at any time to reclaim memory. Save state in `onSaveInstanceState()`.

## Networking: Retrofit (Like Spring's RestTemplate)

```kotlin
// Define API interface
interface ApiService {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") userId: Int): User
    
    @POST("users")
    suspend fun createUser(@Body user: User): User
}

// Create client
val retrofit = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .addConverterFactory(GsonConverterFactory.create())
    .build()

val api = retrofit.create(ApiService::class.java)

// Make request (in coroutine)
lifecycleScope.launch {
    try {
        val user = api.getUser(123)
        textView.text = user.name
    } catch (e: Exception) {
        Toast.makeText(this@MainActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
    }
}
```

**Backend Equivalent:**
```java
// Spring Boot
@Autowired
private RestTemplate restTemplate;

User user = restTemplate.getForObject("https://api.example.com/users/123", User.class);
```

## Async Operations: Coroutines (Like CompletableFuture)

```kotlin
// Backend: CompletableFuture
CompletableFuture.supplyAsync(() -> fetchData())
    .thenApply(data -> processData(data))
    .thenAccept(result -> updateUI(result));

// Android: Coroutines
lifecycleScope.launch {
    val data = withContext(Dispatchers.IO) {
        fetchData()  // Runs on background thread
    }
    val result = processData(data)
    updateUI(result)  // Runs on main thread
}
```

**Rule:** Never block the UI thread. Use `Dispatchers.IO` for network/database, `Dispatchers.Default` for CPU-intensive work.

## Dependency Injection: Hilt (Like Spring)

```kotlin
// Define module
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideApiService(): ApiService {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .build()
            .create(ApiService::class.java)
    }
}

// Inject into Activity
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    @Inject
    lateinit var apiService: ApiService
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // apiService is automatically injected
    }
}
```

**Backend Equivalent:**
```java
@Service
public class UserService {
    @Autowired
    private ApiClient apiClient;
}
```

## Database: Room (Like JPA)

```kotlin
// Entity
@Entity(tableName = "users")
data class User(
    @PrimaryKey val id: Int,
    @ColumnInfo(name = "name") val name: String,
    @ColumnInfo(name = "email") val email: String
)

// DAO
@Dao
interface UserDao {
    @Query("SELECT * FROM users")
    suspend fun getAllUsers(): List<User>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: User)
    
    @Delete
    suspend fun deleteUser(user: User)
}

// Database
@Database(entities = [User::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
```

**Backend Equivalent:**
```java
@Entity
public class User {
    @Id
    private Integer id;
    private String name;
    private String email;
}

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    List<User> findAll();
}
```

## UI: XML Layouts (Like HTML)

```xml
<!-- activity_main.xml -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">
    
    <TextView
        android:id="@+id/titleText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello, Android!"
        android:textSize="24sp" />
    
    <Button
        android:id="@+id/submitButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Submit" />
</LinearLayout>
```

```kotlin
// Access in code
val titleText: TextView = findViewById(R.id.titleText)
titleText.text = "Updated Text"

val submitButton: Button = findViewById(R.id.submitButton)
submitButton.setOnClickListener {
    // Handle click
}
```

**Modern Approach: View Binding**
```kotlin
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        binding.titleText.text = "Updated Text"
        binding.submitButton.setOnClickListener {
            // Handle click
        }
    }
}
```

## Navigation: Fragments (Like SPAs)

```kotlin
// Navigate to another screen
findNavController().navigate(R.id.action_homeFragment_to_detailFragment)

// Pass data
val bundle = Bundle().apply {
    putInt("userId", 123)
}
findNavController().navigate(R.id.action_homeFragment_to_detailFragment, bundle)

// Receive data
val userId = arguments?.getInt("userId")
```

## Common Pitfalls for Backend Engineers

### 1. Memory Leaks

```kotlin
// BAD: Activity reference in background task
class MainActivity : AppCompatActivity() {
    fun fetchData() {
        Thread {
            val data = api.getData()
            runOnUiThread {
                textView.text = data  // Leaks if activity is destroyed
            }
        }.start()
    }
}

// GOOD: Use ViewModel and LiveData
class MainViewModel : ViewModel() {
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data
    
    fun fetchData() {
        viewModelScope.launch {
            val result = api.getData()
            _data.value = result
        }
    }
}
```

### 2. Blocking the UI Thread

```kotlin
// BAD
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val data = api.getData()  // Network on main thread = ANR!
    textView.text = data
}

// GOOD
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    lifecycleScope.launch {
        val data = withContext(Dispatchers.IO) {
            api.getData()
        }
        textView.text = data
    }
}
```

### 3. Not Handling Configuration Changes

```kotlin
// BAD: Data lost on rotation
var userData: User? = null

// GOOD: Use ViewModel
class MainViewModel : ViewModel() {
    var userData: User? = null  // Survives configuration changes
}
```

## Testing

```kotlin
// Unit test (like JUnit)
@Test
fun `test user validation`() {
    val user = User(id = 1, name = "John", email = "invalid")
    assertFalse(user.isEmailValid())
}

// Instrumented test (on device/emulator)
@Test
fun `test button click`() {
    onView(withId(R.id.submitButton)).perform(click())
    onView(withId(R.id.resultText)).check(matches(withText("Success")))
}
```

## Gradle: Build Configuration

```kotlin
// build.gradle.kts
android {
    compileSdk = 33
    
    defaultConfig {
        applicationId = "com.example.myapp"
        minSdk = 24
        targetSdk = 33
        versionCode = 1
        versionName = "1.0"
    }
    
    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"))
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.9.0")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.5.1")
}
```

## Conclusion

Android development for backend engineers is about learning new patterns:
- **Lifecycle management** instead of stateless requests
- **Async UI updates** instead of synchronous responses
- **Resource constraints** (battery, memory) instead of server resources

**Key Takeaways:**
- Use Kotlin coroutines for async operations
- Leverage ViewModel for lifecycle-aware data
- Retrofit for networking (like RestTemplate)
- Room for database (like JPA)
- Hilt for dependency injection (like Spring)

---

*What surprised you most about Android development? Share your experiences!*
