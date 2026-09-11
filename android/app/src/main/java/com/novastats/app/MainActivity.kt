package com.novastats.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.novastats.app.bridge.NovaBridge
import com.novastats.app.worker.BillboardWorker
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var bridge: NovaBridge

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        // Configure WebView
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
        }

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = WebViewClient()

        // Inject NovaBridge to window.NovaBridge
        bridge = NovaBridge(this, webView)
        webView.addJavascriptInterface(bridge, "NovaBridge")

        // Load local React bundle or live preview URL
        webView.loadUrl("file:///android_asset/dist/index.html")

        // Schedule periodic Billboard worker (runs weekly)
        scheduleBillboardWorker()
    }

    private fun scheduleBillboardWorker() {
        val weeklyWorkRequest = PeriodicWorkRequestBuilder<BillboardWorker>(7, TimeUnit.DAYS)
            .build()

        WorkManager.getInstance(applicationContext).enqueueUniquePeriodicWork(
            "WeeklyBillboardSnapshot",
            ExistingPeriodicWorkPolicy.KEEP,
            weeklyWorkRequest
        )
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
