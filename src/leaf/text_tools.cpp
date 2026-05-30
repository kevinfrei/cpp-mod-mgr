#include <algorithm>
#include <cctype>
#include <cstdint>
#include <string>
#include <string_view>

#include "text_tools.hpp"

namespace text {

constexpr char32_t COMBINING_GRAVE = 0x0300;
constexpr char32_t COMBINING_ACUTE = 0x0301;
constexpr char32_t COMBINING_CIRCUMFLEX = 0x0302;
constexpr char32_t COMBINING_TILDE = 0x0303;
constexpr char32_t COMBINING_DIAERESIS = 0x0308;
constexpr char32_t COMBINING_RING_ABOVE = 0x030a;
constexpr char32_t COMBINING_CEDILLA = 0x0327;
constexpr char32_t COMBINING_SLASH = 0x0337;

namespace {
// This puts the codepoint, as UTF8, into result. It will split diacritics into
// separate combining characters.
void handle_codepoint(std::string& result, char32_t codepoint);

// This will uncombine common Latin letters with diacritics into base letters,
// returning true if it did so, false if it didn't.
// If it returns false, the caller should handle the codepoint normally.
bool uncombine_latin(std::string& result, char32_t codepoint);

bool is_onebyte(unsigned char c) {
  return c <= 0x7f;
}

bool is_twobyte_prefix(unsigned char c) {
  return (c & 0xe0) == 0xc0;
}

bool is_twobyte_continuation(std::string_view input,
                             std::string_view::size_type i,
                             unsigned char* c2) {
  if (i + 1 >= input.size())
    return false;
  *c2 = static_cast<unsigned char>(input[i + 1]);
  return (*c2 & 0xc0) == 0x80;
}

bool is_threebyte_prefix(unsigned char c) {
  return (c & 0xf0) == 0xe0;
}

bool is_threebyte_continuation(std::string_view input,
                               std::string_view::size_type i,
                               unsigned char* c2,
                               unsigned char* c3) {
  if (i + 2 >= input.size())
    return false;
  *c2 = static_cast<unsigned char>(input[i + 1]);
  *c3 = static_cast<unsigned char>(input[i + 2]);
  return ((*c2 & 0xc0) == 0x80 && (*c3 & 0xc0) == 0x80);
}

bool is_fourbyte_prefix(unsigned char c) {
  return (c & 0xf8) == 0xf0;
}

bool is_fourbyte_continuation(std::string_view input,
                              std::string_view::size_type i,
                              unsigned char* c2,
                              unsigned char* c3,
                              unsigned char* c4) {
  if (i + 3 >= input.size())
    return false;
  *c2 = static_cast<unsigned char>(input[i + 1]);
  *c3 = static_cast<unsigned char>(input[i + 2]);
  *c4 = static_cast<unsigned char>(input[i + 3]);
  return ((*c2 & 0xc0) == 0x80 && (*c3 & 0xc0) == 0x80 && (*c4 & 0xc0) == 0x80);
}

void handle_codepoint(std::string& result, char32_t codepoint) {
  // Convert the 'unified' diacritics to suffixed modifiers.
  if (!uncombine_latin(result, codepoint)) {
    if (codepoint <= 0x7f) {
      result.push_back(static_cast<char>(codepoint));
    } else if (codepoint <= 0x7ff) {
      result.push_back(static_cast<char>(0xc0 | ((codepoint >> 6) & 0x1f)));
      result.push_back(static_cast<char>(0x80 | (codepoint & 0x3f)));
    } else if (codepoint <= 0xffff) {
      result.push_back(static_cast<char>(0xe0 | ((codepoint >> 12) & 0x0f)));
      result.push_back(static_cast<char>(0x80 | ((codepoint >> 6) & 0x3f)));
      result.push_back(static_cast<char>(0x80 | (codepoint & 0x3f)));
    } else {
      result.push_back(static_cast<char>(0xf0 | ((codepoint >> 18) & 0x07)));
      result.push_back(static_cast<char>(0x80 | ((codepoint >> 12) & 0x3f)));
      result.push_back(static_cast<char>(0x80 | ((codepoint >> 6) & 0x3f)));
      result.push_back(static_cast<char>(0x80 | (codepoint & 0x3f)));
    }
  }
}

bool uncombine_latin(std::string& result, char32_t codepoint) {
  switch (codepoint) {
    case 0xc0:
      // Latin Capital Letter A with Grave
      handle_codepoint(result, 'A');
      handle_codepoint(result, COMBINING_GRAVE);
      break;
    case 0xc1:
      // Latin Capital Letter A with Acute
      handle_codepoint(result, 'A');
      handle_codepoint(result, COMBINING_ACUTE);
      break;
    case 0xc2:
      handle_codepoint(result, 'A');
      handle_codepoint(result, COMBINING_CIRCUMFLEX);
      break;
    case 0xc3:
      handle_codepoint(result, 'A');
      handle_codepoint(result, COMBINING_TILDE);
      break;
    case 0xc4:
      handle_codepoint(result, 'A');
      handle_codepoint(result, COMBINING_DIAERESIS);
      break;
    case 0xc5:
      handle_codepoint(result, 'A');
      handle_codepoint(result, COMBINING_RING_ABOVE);
      break;
    case 0xc8:
      handle_codepoint(result, 'E');
      handle_codepoint(result, COMBINING_GRAVE);
      break;
    case 0xc9:
      handle_codepoint(result, 'E');
      handle_codepoint(result, COMBINING_ACUTE);
      break;
    case 0xca:
      handle_codepoint(result, 'E');
      handle_codepoint(result, COMBINING_CIRCUMFLEX);
      break;
    case 0xcb:
      handle_codepoint(result, 'E');
      handle_codepoint(result, COMBINING_DIAERESIS);
      break;
    case 0xcc:
      handle_codepoint(result, 'I');
      handle_codepoint(result, COMBINING_GRAVE);
      break;
    case 0xcd:
      handle_codepoint(result, 'I');
      handle_codepoint(result, COMBINING_ACUTE);
      break;
    case 0xce:
      handle_codepoint(result, 'I');
      handle_codepoint(result, COMBINING_CIRCUMFLEX);
      break;
    case 0xcf:
      handle_codepoint(result, 'I');
      handle_codepoint(result, COMBINING_DIAERESIS);
      break;
    case 0xe0:
      handle_codepoint(result, 'a');
      handle_codepoint(result, COMBINING_GRAVE);
      break;
    case 0xe1:
      handle_codepoint(result, 'a');
      handle_codepoint(result, COMBINING_ACUTE);
      break;
    case 0xe2:
      handle_codepoint(result, 'a');
      handle_codepoint(result, COMBINING_CIRCUMFLEX);
      break;
    case 0xe3:
      handle_codepoint(result, 'a');
      handle_codepoint(result, COMBINING_TILDE);
      break;
    case 0xe4:
      handle_codepoint(result, 'a');
      handle_codepoint(result, COMBINING_DIAERESIS);
      break;
    case 0xe5:
      handle_codepoint(result, 'a');
      handle_codepoint(result, COMBINING_RING_ABOVE);
      break;
    case 0xe8:
      handle_codepoint(result, 'e');
      handle_codepoint(result, COMBINING_GRAVE);
      break;
    case 0xe9:
      handle_codepoint(result, 'e');
      handle_codepoint(result, COMBINING_ACUTE);
      break;
    case 0xea:
      handle_codepoint(result, 'e');
      handle_codepoint(result, COMBINING_CIRCUMFLEX);
      break;
    case 0xeb:
      handle_codepoint(result, 'e');
      handle_codepoint(result, COMBINING_DIAERESIS);
      break;
    case 0xec:
      handle_codepoint(result, 'i');
      handle_codepoint(result, COMBINING_GRAVE);
      break;
    case 0xed:
      handle_codepoint(result, 'i');
      handle_codepoint(result, COMBINING_ACUTE);
      break;
    case 0xee:
      handle_codepoint(result, 'i');
      handle_codepoint(result, COMBINING_CIRCUMFLEX);
      break;
    case 0xef:
      handle_codepoint(result, 'i');
      handle_codepoint(result, COMBINING_DIAERESIS);
      break;
    case 0xd2:
      handle_codepoint(result, 'O');
      handle_codepoint(result, COMBINING_GRAVE);
      break;
    case 0xd3:
      handle_codepoint(result, 'O');
      handle_codepoint(result, COMBINING_ACUTE);
      break;
    case 0xd4:
      handle_codepoint(result, 'O');
      handle_codepoint(result, COMBINING_CIRCUMFLEX);
      break;
    case 0xd5:
      handle_codepoint(result, 'O');
      handle_codepoint(result, COMBINING_TILDE);
      break;
    case 0xd6:
      handle_codepoint(result, 'O');
      handle_codepoint(result, COMBINING_DIAERESIS);
      break;
    case 0xd8:
      handle_codepoint(result, 'O');
      handle_codepoint(result, COMBINING_SLASH);
      break;
    case 0xf2:
      handle_codepoint(result, 'o');
      handle_codepoint(result, COMBINING_GRAVE);
      break;
    case 0xf3:
      handle_codepoint(result, 'o');
      handle_codepoint(result, COMBINING_ACUTE);
      break;
    case 0xf4:
      handle_codepoint(result, 'o');
      handle_codepoint(result, COMBINING_CIRCUMFLEX);
      break;
    case 0xf5:
      handle_codepoint(result, 'o');
      handle_codepoint(result, COMBINING_TILDE);
      break;
    case 0xf6:
      handle_codepoint(result, 'o');
      handle_codepoint(result, COMBINING_DIAERESIS);
      break;
    case 0xf8:
      handle_codepoint(result, 'o');
      handle_codepoint(result, COMBINING_SLASH);
      break;
    case 0xd9:
      handle_codepoint(result, 'U');
      handle_codepoint(result, COMBINING_GRAVE);
      break;
    case 0xda:
      handle_codepoint(result, 'U');
      handle_codepoint(result, COMBINING_ACUTE);
      break;
    case 0xdb:
      handle_codepoint(result, 'U');
      handle_codepoint(result, COMBINING_CIRCUMFLEX);
      break;
    case 0xdc:
      handle_codepoint(result, 'U');
      handle_codepoint(result, COMBINING_DIAERESIS);
      break;
    case 0xf9:
      handle_codepoint(result, 'u');
      handle_codepoint(result, COMBINING_GRAVE);
      break;
    case 0xfa:
      handle_codepoint(result, 'u');
      handle_codepoint(result, COMBINING_ACUTE);
      break;
    case 0xfb:
      handle_codepoint(result, 'u');
      handle_codepoint(result, COMBINING_CIRCUMFLEX);
      break;
    case 0xfc:
      handle_codepoint(result, 'u');
      handle_codepoint(result, COMBINING_DIAERESIS);
      break;
    case 0xc7:
      handle_codepoint(result, 'C');
      handle_codepoint(result, COMBINING_CEDILLA);
      break;
    case 0xe7:
      handle_codepoint(result, 'c');
      handle_codepoint(result, COMBINING_CEDILLA);
      break;
    case 0xd1:
      handle_codepoint(result, 'N');
      handle_codepoint(result, COMBINING_TILDE);
      break;
    case 0xf1:
      handle_codepoint(result, 'n');
      handle_codepoint(result, COMBINING_TILDE);
      break;
    default:
      return false; // Not a combined character we know about
  }

  return true;
}

} // namespace
// Normalize a string to diacritic post-modifiers form. This is a very
// simplistic implementation that only handles a few common cases. A full
// implementation would use ICU or similar library.
std::string normalize_latin_to_utf8(std::string_view input) {
  std::string result;
  // Convert the code-page encodings to UTF-8 encodings, in the most
  // simplistic way possible.
  for (auto chr : input) {
    unsigned char c = static_cast<unsigned char>(chr);
    if (!uncombine_latin(result, c)) {
      handle_codepoint(result, c);
    }
  }
  return result;
}

std::string normalize_utf8_or_latin(std::u8string_view input) {
  std::string_view sv(reinterpret_cast<const char*>(input.data()),
                      input.length());
  return normalize_utf8_or_latin(sv);
}

// This is the most likely entrypoint for callers. It will take a string that
// may be in UTF-8 or Latin-1, and return a normalized UTF-8 string with
// diacritics as combining characters.
std::string normalize_utf8_or_latin(std::string_view input) {
  std::string result;
  for (size_t i = 0; i < input.size(); i++) {
    unsigned char c = static_cast<unsigned char>(input[i]);
    char32_t codepoint = 0;
    if (is_onebyte(c)) {
      codepoint = c;
    } else if (is_twobyte_prefix(c)) {
      // Two-byte sequence
      unsigned char c2;
      if (!is_twobyte_continuation(input, i, &c2)) {
        // Invalid continuation byte, or too short. Treat it like a single byte
        codepoint = c;
      } else {
        // High 5 bits in byte 0, next 6 bits in byte 1
        codepoint = ((c & 0x1f) << 6) | (c2 & 0x3f);
        i++; // Consumed an extra byte
      }
    } else if (is_threebyte_prefix(c)) {
      // Three-byte sequence
      unsigned char c2, c3;
      if (!is_threebyte_continuation(input, i + 1, &c2, &c3)) {
        // Invalid continuation bytes, just copy the first byte
        codepoint = c;
      } else {
        // High 4 bits in byte 0, next 6 bits in byte 1, last 6 bits in byte 2
        codepoint = ((c & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f);
        i += 2; // Consumed two extra bytes
      }
    } else if (is_fourbyte_prefix(c)) {
      // Four-byte sequence
      unsigned char c2, c3, c4;
      if (!is_fourbyte_continuation(input, i, &c2, &c3, &c4)) {
        codepoint = c;
      } else {
        // High 3 bits in byte 0, next 6 bits in byte 1, next 6 bits in byte 2,
        // last 6 bits in byte 3
        codepoint = ((c & 0x07) << 18) | ((c2 & 0x3f) << 12) |
                    ((c3 & 0x3f) << 6) | (c4 & 0x3f);
        i += 3; // Consumed three extra bytes
      }
    } else {
      codepoint = c; // Invalid byte, just copy it
    }
    handle_codepoint(result, codepoint);
  }
  return result;
}

// Just lowercase an ASCII string
std::string lowercase(std::string_view str) {
  std::string result;
  result.reserve(str.size());
  for (char c : str) {
    result += toggle_lower(c);
  }
  return result;
}

bool iequals(std::string_view lhs, std::string_view rhs) {
  return std::ranges::equal(lhs, rhs, [](unsigned char a, unsigned char b) {
    return std::tolower(a) == std::tolower(b);
  });
}

} // namespace text