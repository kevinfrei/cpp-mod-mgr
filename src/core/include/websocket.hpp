#pragma once

#include <crow/app.h>

namespace websocket {
void configure(crow::SimpleApp& app);
void keep_alive();
} // namespace websocket
