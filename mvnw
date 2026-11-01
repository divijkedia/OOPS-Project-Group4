#!/bin/sh
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -d "$PROJECT_DIR/.tools/jdk21" ]; then
    for d in "$PROJECT_DIR"/.tools/jdk21/jdk*; do
        if [ -d "$d" ]; then
            export JAVA_HOME="$d"
            break
        fi
    done
fi

if [ -n "$JAVA_HOME" ]; then
    export PATH="$JAVA_HOME/bin:$PATH"
fi

if [ -x "$PROJECT_DIR/.tools/maven/bin/mvn" ]; then
    exec "$PROJECT_DIR/.tools/maven/bin/mvn" "$@"
else
    exec mvn "$@"
fi
