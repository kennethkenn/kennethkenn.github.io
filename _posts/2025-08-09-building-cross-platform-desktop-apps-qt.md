---
layout: post
title: "Building Cross-Platform Desktop Apps with Qt: Lessons Learned"
date: 2025-08-09
categories: [Cross-Platform, Qt]
tags: [Qt, C++, Desktop, Cross-Platform]
---

After shipping Qt applications on Windows, macOS, and Linux for the past three years, I've learned that "write once, run anywhere" is more nuanced than it sounds. Here are the practical lessons that will save you weeks of debugging.

## Lesson 1: File Paths Are Platform-Specific

**The Problem:**
```cpp
// This breaks on Windows
QString path = "/home/user/config.ini";

// This breaks on Linux/macOS
QString path = "C:\\Users\\user\\config.ini";
```

**The Solution:**
```cpp
// Use QStandardPaths for system directories
QString configPath = QStandardPaths::writableLocation(
    QStandardPaths::AppConfigLocation
);

// Use QDir for path manipulation
QDir configDir(configPath);
QString filePath = configDir.filePath("config.ini");

// Or use forward slashes (Qt converts automatically)
QString path = QDir::homePath() + "/myapp/config.ini";
```

**Key Insight:** Qt's `QDir` and `QStandardPaths` handle platform differences automatically. Never hardcode paths.

## Lesson 2: High-DPI Scaling Requires Explicit Support

Modern displays (Retina, 4K) need special handling:

```cpp
int main(int argc, char *argv[]) {
    // MUST be called before QApplication
    QApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
    QApplication::setAttribute(Qt::AA_UseHighDpiPixmaps);
    
    QApplication app(argc, argv);
    // ... rest of your code
}
```

**For custom painting:**
```cpp
void MyWidget::paintEvent(QPaintEvent *event) {
    QPainter painter(this);
    
    // Get device pixel ratio
    qreal dpr = devicePixelRatioF();
    
    // Scale your coordinates
    painter.scale(dpr, dpr);
    
    // Now draw normally
    painter.drawRect(10, 10, 100, 100);
}
```

## Lesson 3: Native Menu Bars on macOS

macOS expects the menu bar at the top of the screen, not in the window:

```cpp
QMenuBar *menuBar = new QMenuBar(nullptr);  // No parent!

QMenu *fileMenu = menuBar->addMenu("File");
fileMenu->addAction("New", this, &MainWindow::newFile, QKeySequence::New);
fileMenu->addAction("Open", this, &MainWindow::openFile, QKeySequence::Open);

#ifdef Q_OS_MAC
    // On macOS, this creates a global menu bar
    setMenuBar(menuBar);
#else
    // On other platforms, it's part of the window
    setMenuBar(menuBar);
#endif
```

**Bonus:** Handle the "About" menu correctly:
```cpp
QAction *aboutAction = new QAction("About MyApp", this);
aboutAction->setMenuRole(QAction::AboutRole);  // macOS moves this automatically
```

## Lesson 4: Deployment is Platform-Specific

### Windows

```bash
# Use windeployqt to bundle dependencies
windeployqt.exe --release --no-translations MyApp.exe

# Create installer with NSIS or Inno Setup
makensis installer.nsi
```

**Gotcha:** You need to ship Visual C++ Redistributables.

### macOS

```bash
# Create app bundle
macdeployqt MyApp.app -dmg

# Sign the app (required for distribution)
codesign --deep --force --verify --verbose \
    --sign "Developer ID Application: Your Name" \
    MyApp.app

# Notarize for Gatekeeper
xcrun altool --notarize-app \
    --primary-bundle-id "com.yourcompany.myapp" \
    --username "your@email.com" \
    --password "@keychain:AC_PASSWORD" \
    --file MyApp.dmg
```

### Linux

```bash
# Use linuxdeployqt or AppImage
linuxdeployqt MyApp -appimage

# Or create a .deb package
dpkg-deb --build myapp-1.0
```

## Lesson 5: Platform-Specific Code is Sometimes Necessary

```cpp
#ifdef Q_OS_WIN
    // Windows-specific: Set window icon
    setWindowIcon(QIcon(":/icons/app.ico"));
#elif defined(Q_OS_MAC)
    // macOS-specific: Set dock icon
    QApplication::setAttribute(Qt::AA_DontShowIconsInMenus);
#elif defined(Q_OS_LINUX)
    // Linux-specific: Set window class for desktop integration
    QApplication::setDesktopFileName("com.yourcompany.myapp.desktop");
#endif
```

**For native APIs:**
```cpp
#ifdef Q_OS_WIN
    #include <windows.h>
    
    void setWindowsTaskbarProgress(int percent) {
        // Use Windows COM APIs
        ITaskbarList3 *taskbar;
        CoCreateInstance(CLSID_TaskbarList, NULL, CLSCTX_INPROC_SERVER,
                         IID_ITaskbarList3, (void**)&taskbar);
        taskbar->SetProgressValue((HWND)winId(), percent, 100);
    }
#endif
```

## Lesson 6: Testing on All Platforms is Non-Negotiable

**Set up CI/CD:**
```yaml
# GitHub Actions example
name: Build

on: [push, pull_request]

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Qt
        uses: jurplel/install-qt-action@v2
      - name: Build
        run: |
          qmake
          nmake

  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Qt
        run: brew install qt
      - name: Build
        run: |
          qmake
          make

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Qt
        run: sudo apt-get install qt5-default
      - name: Build
        run: |
          qmake
          make
```

## Lesson 7: Resource Files Simplify Asset Management

```qrc
<!-- resources.qrc -->
<RCC>
    <qresource prefix="/">
        <file>icons/app.png</file>
        <file>icons/open.png</file>
        <file>styles/dark.qss</file>
    </qresource>
</RCC>
```

```cpp
// Access resources with :/
QPixmap icon(":/icons/app.png");
QFile styleFile(":/styles/dark.qss");
```

**Benefits:**
- Assets are compiled into the executable
- No missing file errors
- Works identically on all platforms

## Lesson 8: Keyboard Shortcuts Must Be Platform-Aware

```cpp
// Qt handles this automatically
QAction *saveAction = new QAction("Save", this);
saveAction->setShortcut(QKeySequence::Save);  // Ctrl+S on Win/Linux, Cmd+S on macOS

// For custom shortcuts
#ifdef Q_OS_MAC
    QKeySequence customShortcut(Qt::CTRL + Qt::Key_K);  // Cmd+K
#else
    QKeySequence customShortcut(Qt::CTRL + Qt::Key_K);  // Ctrl+K
#endif
```

## Lesson 9: Settings Storage Varies by Platform

```cpp
// Qt handles platform-specific locations automatically
QSettings settings("MyCompany", "MyApp");

// Windows: HKEY_CURRENT_USER\Software\MyCompany\MyApp
// macOS: ~/Library/Preferences/com.MyCompany.MyApp.plist
// Linux: ~/.config/MyCompany/MyApp.conf

settings.setValue("window/geometry", saveGeometry());
settings.setValue("theme", "dark");

// Read back
QByteArray geometry = settings.value("window/geometry").toByteArray();
restoreGeometry(geometry);
```

## Lesson 10: Performance Profiling is Platform-Specific

```cpp
// Use Qt's built-in profiler
QElapsedTimer timer;
timer.start();

// Your code here

qDebug() << "Elapsed:" << timer.elapsed() << "ms";
```

**Platform-specific tools:**
- Windows: Visual Studio Profiler
- macOS: Instruments
- Linux: Valgrind, perf

## Common Pitfalls

### 1. Assuming Case-Insensitive File Systems

```cpp
// Works on Windows, breaks on Linux
QFile file("MyFile.txt");  // Actual file: myfile.txt

// Solution: Always match case exactly
```

### 2. Hardcoding Font Sizes

```cpp
// Bad: Looks different on each platform
QFont font("Arial", 12);

// Good: Use system defaults
QFont font = QApplication::font();
font.setPointSize(font.pointSize() + 2);  // Relative sizing
```

### 3. Ignoring Window Decorations

```cpp
// Account for title bar height
int contentHeight = height() - menuBar()->height() - statusBar()->height();
```

## Conclusion

Cross-platform Qt development is achievable, but requires attention to:
- Platform-specific paths and conventions
- High-DPI support
- Deployment tooling
- Continuous testing on all targets

**Key Takeaways:**
- Use Qt's cross-platform APIs (`QDir`, `QStandardPaths`, `QSettings`)
- Test on all platforms regularly
- Embrace platform-specific code when necessary
- Automate deployment with CI/CD

---

*What cross-platform challenges have you faced? Share your experiences!*
