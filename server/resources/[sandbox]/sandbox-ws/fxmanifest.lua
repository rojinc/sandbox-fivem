fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'sandbox-ws'
author 'Dr Nick'
description 'Socket.IO server used by external tools (MDT alerts). TLS material is loaded from convar paths, never shipped with the resource.'
version '1.1.0'

server_only 'yes'

server_scripts {
	'server.js',
	'namespaces/*.js',
}
