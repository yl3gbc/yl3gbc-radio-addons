# SONIKS Monitor addon image — everything compiled from source, -j5.
# Branches/commits are set by build args in addons/monitor/docker-compose.yml.
#
# DuckDB: libduckdb.so 2.1.0-dev built from the exact core commit (DUCKDB_CORE_REF),
# used through libs/db_dev2.1.0 (C API over ctypes). duckdb-python is not used.

ARG DEBIAN_IMAGE=debian:trixie-slim

# --- DuckDB 2.1.0-dev core -> /opt/duckdb/lib/libduckdb.so ------------------------------
FROM ${DEBIAN_IMAGE} AS duckdb

ARG DEBIAN_FRONTEND=noninteractive
ARG JOBS=5
ARG DUCKDB_REPO=https://github.com/duckdb/duckdb.git
ARG DUCKDB_CORE_REF

RUN test -n "$DUCKDB_CORE_REF" || { echo "Set DUCKDB_CORE_REF"; exit 1; }

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential ca-certificates cmake git ninja-build python3 && \
    rm -rf /var/lib/apt/lists/*

# Treeless clone keeps tags, so the version is computed from git (v2.1.0-dev...).
RUN git clone --filter=blob:none --no-checkout "$DUCKDB_REPO" /src/duckdb
WORKDIR /src/duckdb
RUN git checkout "$DUCKDB_CORE_REF" && \
    git log -1 --format="duckdb core: %H %cI"
RUN cmake -G Ninja -S . -B build \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_INSTALL_PREFIX=/opt/duckdb \
        -DBUILD_SHELL=OFF \
        -DBUILD_UNITTESTS=OFF && \
    cmake --build build -j ${JOBS} && \
    cmake --install build && \
    git rev-parse HEAD > /opt/duckdb/duckdb-git-hash.txt && \
    test -f /opt/duckdb/lib/libduckdb.so


# --- Python 3.15, uv, FastAPI/uvicorn/paho, db_dev, monitor ---------------------------------
FROM ${DEBIAN_IMAGE} AS builder

ARG DEBIAN_FRONTEND=noninteractive
ARG JOBS=5
ARG PYTHON_REPO=https://github.com/python/cpython.git
ARG PYTHON_BRANCH
ARG UV_REPO=https://github.com/astral-sh/uv.git
ARG UV_BRANCH
ARG FASTAPI_REF
ARG UVICORN_REF
ARG PAHO_REF

RUN test -n "$PYTHON_BRANCH" -a -n "$UV_BRANCH" \
         -a -n "$FASTAPI_REF" -a -n "$UVICORN_REF" -a -n "$PAHO_REF" \
    || { echo "Set all *_BRANCH / *_REF build args"; exit 1; }

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential ca-certificates curl git pkg-config \
        libbz2-dev libffi-dev liblzma-dev libncurses-dev libreadline-dev \
        libsqlite3-dev libssl-dev uuid-dev zlib1g-dev && \
    rm -rf /var/lib/apt/lists/*

# CPython
RUN git clone --depth 1 --branch "$PYTHON_BRANCH" "$PYTHON_REPO" /src/cpython
WORKDIR /src/cpython
RUN ./configure --prefix=/opt/python --with-ensurepip=no && \
    make -j${JOBS} && \
    make install && \
    git rev-parse HEAD > /opt/python/cpython-git-hash.txt

# Rust toolchain for uv and pydantic-core (FastAPI dependency)
ENV RUSTUP_HOME=/opt/rustup CARGO_HOME=/opt/cargo PATH=/opt/cargo/bin:/opt/python/bin:$PATH
RUN curl -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable

# uv
RUN cargo install --locked --jobs ${JOBS} --git "$UV_REPO" --branch "$UV_BRANCH" uv

# Python packages, all from source
# Every install goes explicitly into the /opt/monitor venv (--python), never into /opt/python.
ENV CMAKE_BUILD_PARALLEL_LEVEL=${JOBS} CARGO_BUILD_JOBS=${JOBS} \
    UV_NO_BINARY=1 PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1
RUN uv venv --python /opt/python/bin/python3 /opt/monitor && \
    uv pip install --python /opt/monitor/bin/python --no-binary :all: \
        "fastapi @ git+https://github.com/fastapi/fastapi.git@${FASTAPI_REF}" \
        "uvicorn @ git+https://github.com/encode/uvicorn.git@${UVICORN_REF}" \
        "paho-mqtt @ git+https://github.com/eclipse-paho/paho.mqtt.python.git@${PAHO_REF}"

# db_dev (libs/db_dev2.1.0, passed in as the "db_dev" build context)
COPY --from=db_dev . /src/db_dev
RUN uv pip install --python /opt/monitor/bin/python --no-deps /src/db_dev

# sgp4 (orbits for the Orbit / Map tab), from source; own layer so the packages above stay cached
ARG SGP4_REF
RUN test -n "$SGP4_REF" || { echo "Set SGP4_REF"; exit 1; }
RUN uv pip install --python /opt/monitor/bin/python --no-binary :all: \
        "sgp4 @ git+https://github.com/brandon-rhodes/python-sgp4.git@${SGP4_REF}"

# Check db_dev against the freshly built libduckdb before going further
COPY --from=duckdb /opt/duckdb /opt/duckdb
RUN /opt/monitor/bin/python -c "import db_dev; print('libduckdb', db_dev.library_version()); print(db_dev.connect().execute('SELECT 42 AS answer').fetchall())"

COPY pyproject.toml /src/monitor/
COPY src /src/monitor/src
RUN uv pip install --python /opt/monitor/bin/python --no-deps /src/monitor


FROM ${DEBIAN_IMAGE}

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates libffi8 libsqlite3-0 libssl3t64 zlib1g && \
    rm -rf /var/lib/apt/lists/*

COPY --from=duckdb /opt/duckdb /opt/duckdb
COPY --from=builder /opt/python /opt/python
COPY --from=builder /opt/monitor /opt/monitor

ENV PATH=/opt/monitor/bin:/opt/python/bin:$PATH \
    DB_DEV_LIBRARY=/opt/duckdb/lib/libduckdb.so \
    PYTHONUNBUFFERED=1

EXPOSE 8090
CMD ["soniks-monitor"]
