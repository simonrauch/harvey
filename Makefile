ARCH := $(shell uname -s)-$(shell uname -m)

harvey:
	npm ci
    ifeq ($(ARCH), Darwin-x86_64)
		npm run pkg:macos-x64
    endif
    ifeq ($(ARCH), Darwin-x86_64)
		npm run pkg:macos-arm64
    endif
    ifeq ($(ARCH), Linux-x86_64)
		npm run pkg:linux-x64
    endif