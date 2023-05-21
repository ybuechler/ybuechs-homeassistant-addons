#!/usr/bin/with-contenv bashio
set +u

bashio::log.info "Starting Server..."
node server.js
bashio::log.info "Server started"