import std;
import ts_cpp_idl.common_types;
import ts_cpp_idl.crow_support;

int main(int argc, const char* argv[]) {
  std::cout << "Hello, Modules! [" << argc << ", " << argv[0] << "]"
            << std::endl;
  Shared::Keys key = Shared::Keys::Next;
  std::cout << "This is from a module that used to be a header: "
            << Shared::to_string(key) << std::endl;
  const std::string_view sv = "\t\\Howdy\n\r";
  std::cout << "And here's some stuff from another modules:" << sv
            << " or, in JSON: " << escape_json_string(sv) << std::endl;
  return 0;
}
