#include <string>

#include <webview.h>

namespace window {

void open(const std::string& url) {
  // 3. Initialize Webview on the Main Thread
  webview::webview w(true, nullptr);
  w.set_title("App emplate");
  w.set_size(800, 600, WEBVIEW_HINT_NONE);
  w.navigate(url);
  w.run(); // This blocks until the window is closed
}

} // namespace window
