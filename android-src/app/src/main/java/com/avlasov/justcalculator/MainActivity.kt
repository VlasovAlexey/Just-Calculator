package com.avlasov.justcalculator

import android.content.Intent
import android.content.res.Configuration
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var container: FrameLayout
    private lateinit var insetsController: WindowInsetsControllerCompat

    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.Theme_JustCalculator)
        super.onCreate(savedInstanceState)

        WindowCompat.setDecorFitsSystemWindows(window, false)
        insetsController = WindowInsetsControllerCompat(window, window.decorView)

        setContentView(R.layout.activity_main)

        container = findViewById(R.id.container)
        webView = findViewById(R.id.webView)

        ViewCompat.setOnApplyWindowInsetsListener(container) { view, windowInsets ->
            val insets = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
            )
            view.setPadding(insets.left, insets.top, insets.right, insets.bottom)
            WindowInsetsCompat.CONSUMED
        }

        webView.apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            settings.useWideViewPort = true
            settings.loadWithOverviewMode = true
            setBackgroundColor(Color.BLACK)

            addJavascriptInterface(ThemeBridge(), "Android")

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val url = request?.url?.toString() ?: return false
                    if (url.startsWith("http://") || url.startsWith("https://")) {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    }
                    return false
                }
            }
            loadUrl("file:///android_asset/index.html")
        }
    }

    inner class ThemeBridge {
        @JavascriptInterface
        fun haptic() {
            val vibrator = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                val vm = getSystemService(VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vm.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                getSystemService(VIBRATOR_SERVICE) as Vibrator
            }
            vibrator.vibrate(VibrationEffect.createOneShot(20, VibrationEffect.DEFAULT_AMPLITUDE))
        }

        @JavascriptInterface
        fun onThemeChanged(isDark: Boolean) {
            runOnUiThread {
                if (isDark) {
                    insetsController.isAppearanceLightStatusBars = false
                    insetsController.isAppearanceLightNavigationBars = false
                    webView.setBackgroundColor(Color.BLACK)
                    container.setBackgroundColor(Color.BLACK)
                } else {
                    val lightColor = Color.parseColor("#f5f5f5")
                    insetsController.isAppearanceLightStatusBars = true
                    insetsController.isAppearanceLightNavigationBars = true
                    webView.setBackgroundColor(lightColor)
                    container.setBackgroundColor(lightColor)
                }
            }
        }
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        webView.post {
            webView.requestLayout()
            webView.evaluateJavascript(
                "document.body.style.display='none';" +
                "document.body.offsetHeight;" +
                "document.body.style.display='';",
                null
            )
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
