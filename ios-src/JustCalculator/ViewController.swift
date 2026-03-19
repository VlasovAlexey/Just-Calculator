import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKScriptMessageHandler {

    private var webView: WKWebView!
    private var isDarkTheme = true

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return isDarkTheme ? .lightContent : .darkContent
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black

        let config = WKWebViewConfiguration()
        config.preferences.javaScriptEnabled = true

        // Add message handler for theme changes from JS
        let contentController = WKUserContentController()
        contentController.add(self, name: "themeChanged")

        // Inject JS bridge: override Android.onThemeChanged to send message to iOS
        let bridgeScript = WKUserScript(
            source: """
            window.Android = {
                onThemeChanged: function(isDark) {
                    window.webkit.messageHandlers.themeChanged.postMessage(isDark);
                }
            };
            """,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        contentController.addUserScript(bridgeScript)
        config.userContentController = contentController

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.backgroundColor = .black
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.translatesAutoresizingMaskIntoConstraints = false

        // Allow content to extend under safe areas
        if #available(iOS 11.0, *) {
            webView.scrollView.contentInsetAdjustmentBehavior = .never
        }

        view.addSubview(webView)

        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])

        loadLocalHTML()
    }

    private func loadLocalHTML() {
        guard let wwwPath = Bundle.main.path(forResource: "www", ofType: nil) else { return }
        let wwwURL = URL(fileURLWithPath: wwwPath)
        let indexURL = wwwURL.appendingPathComponent("index.html")
        webView.loadFileURL(indexURL, allowingReadAccessTo: wwwURL)
    }

    // MARK: - Handle orientation changes
    override func viewWillTransition(to size: CGSize,
                                     with coordinator: UIViewControllerTransitionCoordinator) {
        super.viewWillTransition(to: size, with: coordinator)
        coordinator.animate(alongsideTransition: nil) { _ in
            // Trigger resize in JS for layout recalculation
            self.webView.evaluateJavaScript("window.dispatchEvent(new Event('resize'));", completionHandler: nil)
        }
    }

    // MARK: - WKNavigationDelegate — open external links in Safari
    func webView(_ webView: WKWebView,
                 decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url {
            if url.scheme == "file" {
                decisionHandler(.allow)
                return
            }
            // External link — open in Safari
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }

    // MARK: - WKScriptMessageHandler — theme change from JS
    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        if message.name == "themeChanged", let isDark = message.body as? Bool {
            isDarkTheme = isDark
            let bgColor: UIColor = isDark ? .black : UIColor(red: 0.96, green: 0.96, blue: 0.96, alpha: 1)
            UIView.animate(withDuration: 0.5) {
                self.view.backgroundColor = bgColor
                self.webView.backgroundColor = bgColor
                self.webView.scrollView.backgroundColor = bgColor
                self.setNeedsStatusBarAppearanceUpdate()
            }
        }
    }
}
