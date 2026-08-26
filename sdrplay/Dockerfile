ARG CORE_IMAGE=soniks-client-core:2.3.0-amd64

# ==============================================================================
# BUILDER — SoapySDRPlay3
# ==============================================================================
FROM ${CORE_IMAGE} AS builder

USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        cmake \
        git \
        libsoapysdr-dev \
        pkg-config && \
    rm -rf /var/lib/apt/lists/*

COPY package /tmp/sdrplay

RUN install -m 0644 \
        /tmp/sdrplay/amd64/libsdrplay_api.so.3.15 \
        /usr/local/lib/libsdrplay_api.so.3.15 && \
    ln -sfn libsdrplay_api.so.3.15 /usr/local/lib/libsdrplay_api.so.3 && \
    ln -sfn libsdrplay_api.so.3 /usr/local/lib/libsdrplay_api.so && \
    install -m 0644 /tmp/sdrplay/inc/sdrplay_api*.h /usr/local/include/ && \
    ldconfig

WORKDIR /tmp

RUN git clone --depth 1 \
    https://github.com/pothosware/SoapySDRPlay3.git

WORKDIR /tmp/SoapySDRPlay3/build

RUN cmake \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_INSTALL_PREFIX=/usr/local \
        .. && \
    cmake --build . -j4 && \
    cmake --install . --strip


# ==============================================================================
# FINAL — SONIKS CORE + SDRplay
# ==============================================================================
FROM ${CORE_IMAGE}

USER root

COPY --from=builder \
    /usr/local/lib/SoapySDR/modules0.8/libsdrPlaySupport.so \
    /usr/local/lib/SoapySDR/modules0.8/libsdrPlaySupport.so

COPY package/amd64/libsdrplay_api.so.3.15 \
    /usr/local/lib/libsdrplay_api.so.3.15

COPY package/amd64/sdrplay_apiService \
    /tmp/sdrplay_apiService

COPY package/sdrplay_license.txt \
    /tmp/sdrplay_license.txt

RUN ln -sfn libsdrplay_api.so.3.15 /usr/local/lib/libsdrplay_api.so.3 && \
    ln -sfn libsdrplay_api.so.3 /usr/local/lib/libsdrplay_api.so && \
    install -D -m 0755 \
        /tmp/sdrplay_apiService \
        /opt/sdrplay_api/sdrplay_apiService && \
    install -D -m 0644 \
        /tmp/sdrplay_license.txt \
        /usr/share/licenses/sdrplay/sdrplay_license.txt && \
    ldconfig
