#!/usr/bin/env python3
"""Syntax-check every Lua file under a tree with a real Lua 5.4 compiler (lupa).

Cfx's Lua 5.4 fork adds a few syntax extensions that stock Lua rejects:
  * safe navigation  a?.b  a?[k]  a?:m()
  * compound assignment  x += 1, s ..= "x", etc.
This script rewrites those into stock-Lua equivalents before compiling so that
the check only reports genuine syntax errors.

Usage: luacheck.py ROOT [--out result.json] [--exclude-size N]
Prints a summary and writes {relpath: error} for failing files.
"""
import argparse
import json
import os
import re
import sys

from lupa import lua54

L = lua54.LuaRuntime()
_check = L.eval(
    'function(src, name) local f, err = load(src, name, "t") '
    'if f then return true, nil end return false, err end'
)

COMPOUND = re.compile(
    r'^(?P<indent>\s*)(?P<lhs>[A-Za-z_]\w*(?:\.[A-Za-z_]\w*|:[A-Za-z_]\w*|\[(?:[^\[\]\n]|\[[^\]\n]*\])*\])*)'
    r'\s*(?P<op>\+|-|\*|/|//|%|\^|\.\.|&|\||<<|>>)=\s*(?P<rhs>.+)$'
)


def preprocess(src: str) -> str:
    # backtick hash literals: `weapon_pistol` -> joaat hash (an integer at compile time)
    src = re.sub(r'`[^`\n]*`', '0', src)
    # safe navigation
    src = re.sub(r'\?\.', '.', src)
    src = re.sub(r'\?\[', '[', src)
    src = re.sub(r'\?:', ':', src)
    # 'in' unpacking:  local a, b in t   ->  local a, b = t.a, t.b
    def _in_unpack(m):
        names = [n.strip() for n in m.group(2).split(',')]
        return f"{m.group(1)}local {', '.join(names)} = " + ', '.join(f"{m.group(3)}.{n}" for n in names)
    src = re.sub(r'^(\s*)local\s+([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s+in\s+([A-Za-z_][\w.]*)\s*$', _in_unpack, src, flags=re.M)
    # set constructors:  { .a, .b }  ->  { a = true, b = true }
    src = re.sub(r'^(\s*)\.([A-Za-z_]\w*)\s*(,?)\s*$', r'\1\2 = true\3', src, flags=re.M)
    out = []
    for line in src.split('\n'):
        m = COMPOUND.match(line)
        if m and not line.lstrip().startswith('--'):
            line = f"{m['indent']}{m['lhs']} = {m['lhs']} {m['op']} ({m['rhs']})"
        out.append(line)
    return '\n'.join(out)


def check_file(path: str):
    with open(path, 'rb') as fh:
        raw = fh.read()
    try:
        src = raw.decode('utf-8')
    except UnicodeDecodeError:
        src = raw.decode('latin-1')
    if src.startswith('﻿'):
        src = src[1:]
    ok, err = _check(preprocess(src), '=' + os.path.basename(path))
    return bool(ok), (None if ok else str(err))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('root')
    ap.add_argument('--out')
    ap.add_argument('--exclude-size', type=int, default=0,
                    help='skip files of exactly this byte size (obfuscated blobs)')
    args = ap.parse_args()

    failures = {}
    total = 0
    for dirpath, dirnames, filenames in os.walk(args.root):
        dirnames[:] = [d for d in dirnames if d not in ('node_modules', '.git', 'dist')]
        for fn in filenames:
            if not fn.endswith('.lua'):
                continue
            p = os.path.join(dirpath, fn)
            if args.exclude_size and os.path.getsize(p) == args.exclude_size:
                continue
            total += 1
            ok, err = check_file(p)
            if not ok:
                failures[os.path.relpath(p, args.root)] = err
    print(f'checked {total} lua files, {len(failures)} failed')
    for k, v in sorted(failures.items()):
        print(f'  {k}: {v}')
    if args.out:
        with open(args.out, 'w') as fh:
            json.dump(failures, fh, indent=1, sort_keys=True)
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
