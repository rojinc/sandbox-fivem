# Sandbox RP

A heavily modified version of the Mythic Framework for Sandbox RP: a component-based
FiveM framework in Lua 5.4 whose interfaces are Svelte 5 apps built on one shared design
system (`/ui-kit`: one dark theme, Roboto, Tabler icons). Released with the permission of
the original Mythic Framework authors Alzar & Dr Nick.

Start with `CLAUDE.md` (layout and rules), `DESIGN.md` (the interface design brief),
`docs/NUI-GUIDE.md` (how the interfaces are built and verified) and `CHANGELOG.md`
(what changed in the cleanup).

## Building the interfaces

```bash
npm install          # once, at the repository root (Node 20.19+)
npm run build        # builds every server/resources/[sandbox]/*/ui into ui/dist
npm run luacheck     # Lua 5.4 syntax check of every resource (pip install lupa)
node scripts/preview.mjs --ui sandbox-hud   # headless screenshots of a UI's preview scenarios
```

`ui/dist` folders are committed because FiveM serves them as-is; rebuild and commit them
whenever a UI changes.

## Dependencies

| Packages          | Link                                                                |
| ----------------- | ------------------------------------------------------------------ |
| NodeJS | [Download Here](https://nodejs.org/en/download?text=+) |
| MongoDB | [Download Here](https://www.mongodb.com/try/download/community) (v6.0.5) |
| MariaDB | [Download Here](https://mariadb.org/download/?t=mariadb&p=mariadb&r=10.6.12&os=windows&cpu=x86_64&pkg=msi&m=acorn) (v10.6.12)
| HeidiSQL | [Download Here](https://www.heidisql.com/download.php) (*can be installed via MariaDB)
| Git for Windows | [Download Here](https://git-scm.com/download/win)

# NOTE:
This will not work out of the box, you will need to make modifications to the base to replace the WebAPI calls with whatever authentication source you're wanting to do. If you don't understand how to do that, go use ESX.

## Prerequisites & Setup

Clone the project

```bash
  git clone git@github.com:badcodestv/sandbox-server.git
```

Go to the project directory

```bash
  cd sandboxrp-server
```

Download latest FiveM Windows Artifact
- [Download Here](https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/)

Create new `artifact` folder in the root directory

```bash
  mkdir artifact
```

Move downloaded artifact files into the artifact folder
- Best to just use windows explorer to move things around!


Create `txData` folder in root directory

```bash
  mkdir txData
```

Go into the `server/config` directory and duplicate the `example` files. Remove `example` from the duplicated files.

- `example.core.ptr.cfg` -> `core.ptr.cfg`
- `example.database.ptr.cfg` -> `database.ptr.cfg`
- `example.mongodb.ptr.cfg` -> `mongodb.ptr.cfg`

Fill in the correct database information for **Heidi/MariaDB** in `database.ptr.cfg`
Fill in the correct database information for **MongoDB** in `mongodb.ptr.cfg`

Go into the `server/` directory and duplicate the `example.server.ptr.cfg` file. Remove `example` from the duplicated file.

- `example.server.ptr.cfg` -> `server.ptr.cfg`

Add your `cfx` key into the `sv_licenseKey` field (*will add my own key soon so mlos can be used)

## Importing Database (MariaDB)
Using **HeidiSQL**, import the `database.sql` file.

## Launching Server
If this is your first time launching this server, use `./artifact/FXServer.exe` to launch. It'll prompt you to create a **txAdmin** username/password and link your FiveM account. Once you do so, you'll want to link the project to an existing project and setting the filepaths for the `.cfg` files. 

![txAdmin](https://i.ibb.co/0yfp7Qt/txadmin.jpg)

Once that is set up, let it load the resources and setup. You'll want to make sure you turn on `OneSync` in **txAdmin** so the server can properly work and **restart** the server.

You'll notice a `.bat` file that's in the root directory. You'll want to use that to start your server up each and every time (easy). But, you'll need to go back into txAdmin and update the paths to the `*.cfg` files again - but, that's no problem!

## Using Admin

In the MongoDB GUI, under the `_auth.users` collection, add a new dataset under the `groups` array called either `admin`, `owner`, or `staff`. If you're already in the server, soft or hard relog to retrieve the new permissions. 

To use the admin tool, run `/admin` or `/staff`.

## Using Logs

Discord Logging only works in `production` mode in `core.*.cfg` so if you want logs on your dev server, set your environment to `prod` in `core.ptr.cfg`