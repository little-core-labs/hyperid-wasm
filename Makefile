CLANG ?= /opt/wasi-sdk/bin/clang

WASMOPT ?= $(shell which wasm-opt)
WASM2JS ?= $(shell pwd)/node_modules/.bin/wasm2js

ifeq ($(CC),cc)
	CC = $(CLANG)
endif

ifeq ($(CC),gcc)
	CC = $(CLANG)
endif

ZZ ?= $(shell which zz)
SRC = $(wildcard src/*.zz)
CWD = $(shell pwd)
TARGET = hyperid.wasm

CFLAGS += --target=wasm32-unknown-unknown
CFLAGS += -nostdlib

LDFLAGS += -Wl,--export=sizeof_hyperid_Context
LDFLAGS += -Wl,--export=sizeof_hyperid_Options
LDFLAGS += -Wl,--export=sizeof_hyperid_Result
LDFLAGS += -Wl,--export=sizeof_hyperid_UUID

LDFLAGS += -Wl,--export=hyperid_result_encoding_length
LDFLAGS += -Wl,--export=hyperid_generate
LDFLAGS += -Wl,--export=hyperid_count
LDFLAGS += -Wl,--export=hyperid_make

LDFLAGS += -Wl,--export=__heap_base

LDFLAGS += -Wl,--import-memory
LDFLAGS += -Wl,--no-entry # don't look for a _start function
LDFLAGS += -Wl,--allow-undefined
LDFLAGS += -Wl,--strip-all
LDFLAGS += -nostartfiles

ZZFLAGS += --release

export CC
export CFLAGS
export LDFLAGS
export ZZ_MODULE_PATHS=$(CWD)/node_modules:$(CWD)/node_modules/@little-core-labs

.PHONY: target

build: $(TARGET) hyperid.js

$(TARGET): $(SRC)
	$(ZZ) build $(ZZFLAGS)
	cp target/release/lib/libhyperid.so $@
ifneq ($(WASMOPT),)
	$(WASMOPT) -Oz $@ -o $@
endif

hyperid.js: $(TARGET)
	$(WASM2JS) $(TARGET) -o $@

clean:
	$(ZZ) clean
	$(RM) hyperid.js $(TARGET)

test: hyperid.js
	npm t
