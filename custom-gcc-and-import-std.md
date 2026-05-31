# Using a custom GCC (version 16) to build import std on Linux (Debian 13):

First, go download and install gcc16.

Next, you have to compile the `import std;` module, using GCC and a 'module
mapper'. So, let's create a "GCM" cache:

```sh
mkdir ~/.gcm-cache
```

then (assuming you've got GCC16 installed and set as your default compiler) run
this command:

```sh
g++ -std=c++23 -fmodules "-fmodule-mapper=|@g++-mapper-server -r $HOME/.gcm-cache" -fsearch-include-path -c bits/std.cc
```

That will generate the GCM file for std. I tried doing it with
bits/std.compat.cc, but that came up with compiler errors.

Once you've got that built, this repo has all the weirdness you have to use
built in. Specifically, I created a wrapper around `g++` so that it will have
the final say for the `-fmodule-mapper=` flag, which enables using the GCM cache
we populated earlier.
