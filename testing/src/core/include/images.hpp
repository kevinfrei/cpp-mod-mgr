#pragma once

#include <filesystem>

namespace image {
std::filesystem::path get_image_path(const std::string& query_path);
}