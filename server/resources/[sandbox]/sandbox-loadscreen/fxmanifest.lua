fx_version("cerulean")
games({ "gta5" })
lua54("yes")
client_script("@sandbox-base/components/cl_error.lua")
client_script("@sandbox-pwnzor/client/check.lua")

loadscreen("ui/dist/index.html")

loadscreen_manual_shutdown("yes")

files({
	"ui/dist/index.html",
	"ui/dist/assets/*",
})
