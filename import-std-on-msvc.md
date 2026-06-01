# Getting 'import std;' working with Visual C++ & CMake

I'm probably weird, but I find the idea of needing set a !@#$ing GUID in my
build settings to enable CMake's experimental support for `import std;`
off-putting.

So, instead, I'm building stuff myself, because that's what I apparently do.

Here's what I did to create the `.ifc` and `.obj` files that MSVC wants in order
to properly using `import std;` from random C++ land.:

(I did all this as administrator, because I'm writing to a protected location)

```sh
cd %VCToolsInstallDir%
mkdir MT MTd MD MDd
cl /std:c++latest /EHsc /nologo /MT /DNDEBUG /c std.ixx /ifcOutput MT\ /FoMT\
cl /std:c++latest /EHsc /nologo /MTd /D_DEBUG /c std.ixx /ifcOutput MTd\ /FoMTd\
cl /std:c++latest /EHsc /nologo /MD /DNDEBUG /c std.ixx /ifcOutput MD\ /FoMD\
cl /std:c++latest /EHsc /nologo /MDd /D_DEBUG /c std.ixx /ifcOutput MDd\ /FoMDd\
```

That basically builds the 4 'common' configurations of the standard library:
Static Lib/Static Debug Lib, and DLL, Debug DLL.

Then you have to add
`/reference "std=$ENV{VCToolsInstallDir}modules\\MTd\\std.ifc"` as a compile
options (replace MTd with your C++ preferred runtime flavor).

Because this is still messy (it's messy in different ways from GCC & Clang,
conveniently enough), I'm trying to automate everything in a script.
