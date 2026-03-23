# JustCalculator

**[Try this calculator online](https://vlasovalexey.github.io/Just-Calculator/html-src/)**

**[Calculator App Play Store](https://play.google.com/store/apps/details?id=com.avlasov.justcalculator)**

**[Calculator App RuStore](https://play.google.com/store/apps/details?id=com.avlasov.justcalculator)**


A simple, elegant calculator. A calculator that does not collect your personal data, analytics, or any data whatsoever. It's just a calculator. Simply yours entirely. That's why it was made for mobile platforms and can be installed as a native app or as a PWA app as well.
Built with pure HTML, CSS, and JavaScript — no frameworks, no dependencies. Wraps into native Android and iOS apps via WebView.

## Screenshots

| Portrait | Landscape |
|----------|-----------|
| ![Portrait Dark](screenshots/portrait.png) | ![Landscape Dark](screenshots/landscape.png) |
| ![Portrait Light](screenshots/portrait-light.png) | ![Landscape Light](screenshots/landscape-light.png) |

## Features

- Time-tested calculations using the math.js library. For more details, visit https://github.com/josdejong/mathjs
- **Responsive design** — adapts seamlessly to any screen size, from small phones to large desktop windows
- **Portrait & landscape modes** — landscape reveals an extended scientific calculator panel with trigonometric, logarithmic, and power functions
- **Live preview** — shows the intermediate result in real time as you type, just like Google Calculator
- **Input validation** — prevents invalid input sequences (double operators, repeated functions, etc.)
- **Auto-copy** — result is automatically copied to clipboard when you press `=`
- **Scientific functions** — sin, cos, tan, sinh, cosh, tanh, ln, log10, sqrt, cbrt, abs, factorial, powers, and more
- **Dark & Light themes** — toggle between dark and light modes

## Getting Started

### Web (Browser)

**[Try this calculator online](https://vlasovalexey.github.io/Just-Calculator/html-src/)**

### PWA — Install on Android

1. Open the calculator URL in **Google Chrome**
2. Tap the **three-dot menu** (⋮) in the top right
3. Tap **"Install app"** or **"Add to Home screen"**
4. Confirm — the calculator icon will appear on your home screen
5. The app works **offline** thanks to the Cache First service worker

### PWA — Install on iOS

1. Open the calculator URL in **Safari** (PWA install only works in Safari on iOS)
2. Tap the **Share button** (↑) at the bottom of the screen
3. Scroll down and tap **"Add to Home Screen"**
4. Edit the name if needed and tap **"Add"**
5. The calculator icon will appear on your home screen and run in full-screen mode without Safari UI

### Android (Native)

1. Open the `android-src` folder in **Android Studio Otter** (or newer)
2. Sync Gradle
3. Run on a device or emulator with **Android 11+**

### iOS (Native)

1. Open `ios-src/JustCalculator.xcodeproj` in **Xcode 15** (or newer)
2. Select your development team in **Signing & Capabilities**
3. Select a target device or simulator (iPhone / iPad)
4. Press **Cmd + R** to build and run
5. Minimum deployment target: **iOS 15.0**

> **Note:** You need a Mac with Xcode installed to build the iOS project. For running on a physical device, an Apple Developer account is required.

## Requirements

- **Web**: Any modern browser (Chrome, Firefox, Safari, Edge)
- **PWA**: Chrome (Android), Safari (iOS), Edge, or any Chromium-based browser
- **Android**: Android 11 (API 30) or higher
- **iOS**: iOS 15.0 or higher, Xcode 15+

## License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](LICENSE) file for details.
