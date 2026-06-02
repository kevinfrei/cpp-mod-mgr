#pragma once

#include <optional>
#include <string>
#include <string_view>

#include <crow.h>

namespace tools {

void e404(crow::response& resp, const std::string& message);
std::optional<std::string> url_decode(std::string_view sv);
std::string url_encode(std::string_view sv);

} // namespace tools