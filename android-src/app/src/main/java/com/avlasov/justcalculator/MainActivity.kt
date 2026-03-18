package com.avlasov.justcalculator

import android.content.Intent
import android.content.res.Configuration
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
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
        fun onThemeChanged(isDark: Boolean) {
            runOnUiThread {
                val window = this@MainActivity.window
                if (isDark) {
                    window.statusBarColor = Color.BLACK
                    window.navigationBarColor = Color.BLACK
                    window.decorView.systemUiVisibility =
                        window.decorView.systemUiVisibility and
                            android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv() and
                            android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR.inv()
                    webView.setBackgroundColor(Color.BLACK)
                } else {
                    val lightColor = Color.parseColor("#f5f5f5")
                    window.statusBarColor = lightColor
                    window.navigationBarColor = lightColor
                    window.decorView.systemUiVisibility =
                        window.decorView.systemUiVisibility or
                            android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or
                            android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
                    webView.setBackgroundColor(lightColor)
                }
            }
        }
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        // Force WebView to recalculate layout after orientation change
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
