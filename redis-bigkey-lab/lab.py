#!/usr/bin/env python3
import os, socket, sys, time, zlib
PREFIX = 'lab:bigkey:20260929:'
TTL = 86400
class Redis:
    def __init__(self):
        self.s = socket.create_connection(('127.0.0.1', int(os.environ.get('REDIS_PORT', '6380'))), timeout=30)
        self.f = self.s.makefile('rb')
        self.cmd('SELECT', 3)
    def send(self, *args):
        values = [a if isinstance(a, bytes) else str(a).encode() for a in args]
        self.s.sendall(b'*%d\r\n' % len(values) + b''.join(b'$%d\r\n' % len(v) + v + b'\r\n' for v in values))
    def read(self):
        line = self.f.readline()
        if not line: raise ConnectionError('Redis disconnected')
        t, v = line[:1], line[1:-2]
        if t == b'-': raise RuntimeError(v.decode())
        if t == b'+': return v.decode()
        if t == b':': return int(v)
        if t == b'$':
            n = int(v)
            if n < 0: return None
            data = self.f.read(n)
            if len(data) != n or self.f.read(2) != b'\r\n': raise ConnectionError('Incomplete reply')
            return data
        if t == b'*': return [self.read() for _ in range(int(v))]
        raise RuntimeError('Unexpected response')
    def cmd(self, *args):
        self.send(*args)
        return self.read()
    def close(self):
        self.f.close()
        self.s.close()
def keys(r):
    cursor = 0
    while True:
        cursor, batch = r.cmd('SCAN', cursor, 'MATCH', PREFIX + '*', 'COUNT', 100)
        yield from batch
        if int(cursor) == 0: break

def seed(r):
    names = ['small', 'string32m', 'hash100k', 'hash100k-delete']
    if any(r.cmd('EXISTS', PREFIX+n) for n in names):
        raise RuntimeError('Experiment keys already exist. Run cleanup first if you want to recreate them.')
    r.cmd('SET', PREFIX+'small', 'hello', 'EX', TTL)
    r.cmd('SET', PREFIX+'string32m', b'x'*(32*1024*1024), 'EX', TTL)
    seed_hashes(r)
    for name in names:
        key = PREFIX+name
        kind = r.cmd('TYPE', key)
        size = r.cmd('HLEN' if kind == 'hash' else 'STRLEN', key)
        print(key, kind, 'length=', size, 'memory_bytes=', r.cmd('MEMORY','USAGE',key), 'ttl=',r.cmd('TTL',key))

def seed_hashes(r):
    names = ['hash100k', 'hash100k-delete']
    if any(r.cmd('EXISTS', PREFIX+n) for n in names):
        raise RuntimeError('Hash keys already exist; existing data is preserved')
    for name in names:
        key = PREFIX+name
        for start in range(0, 100000, 500):
            args = []
            for i in range(start, start+500): args.extend((f'f:{i:06d}', b'v'*128))
            r.cmd('HSET', key, *args)
            if start == 0: r.cmd('EXPIRE', key, TTL)
            time.sleep(.002)
    for name in names:
        print(PREFIX+name, 'fields=', r.cmd('HLEN',PREFIX+name))

def split(r):
    source = PREFIX+'hash100k'
    if r.cmd('TYPE',source) != 'hash': raise RuntimeError('Source hash missing')
    destinations = [PREFIX+f'hash-shard:{i:02d}' for i in range(16)]
    if any(r.cmd('EXISTS', key) for key in destinations): raise RuntimeError('Shards already exist; cleanup and seed before repeating')
    expiry = r.cmd('PEXPIRETIME',source)
    cursor = 0
    while True:
        cursor, items = r.cmd('HSCAN',source,cursor,'COUNT',500)
        groups = {}
        for field,value in zip(items[::2],items[1::2]):
            groups.setdefault(zlib.crc32(field)%16, []).extend((field,value))
        for bucket, args in groups.items():
            key = destinations[bucket]
            r.cmd('HSET',key,*args)
            if expiry > 0: r.cmd('PEXPIREAT',key,expiry)
        if int(cursor) == 0: break
        time.sleep(.002)
    count = sum(r.cmd('HLEN',key) for key in destinations)
    original = r.cmd('HLEN',source)
    if count != original: raise RuntimeError(f'Count mismatch: {count} != {original}')
    print(f'Copied {count} fields into 16 shards; source retained. Use crc32(field.encode()) % 16 to route reads/writes.')
    print('For this static experiment only. Live writes require migration coordination and stronger verification.')

def slow(r):
    r.cmd('CLIENT','SETNAME','bigkey-lab-slow-reader')
    r.s.setsockopt(socket.SOL_SOCKET,socket.SO_RCVBUF,4096)
    r.send('GET',PREFIX+'string32m')
    print('GET sent; intentionally not reading for 20 seconds. Inspect CLIENT LIST on another connection.', flush=True)
    time.sleep(20)
    print('Closing slow connection; server output buffer will be released.')

def main():
    mode = sys.argv[1] if len(sys.argv)>1 else 'help'
    if mode not in ('seed','seed-hashes','split','slow-reader','cleanup'):
        print('Usage: python3 lab.py seed|seed-hashes|split|slow-reader|cleanup'); return
    r = Redis()
    try:
        if mode == 'seed': seed(r)
        elif mode == 'seed-hashes': seed_hashes(r)
        elif mode == 'split': split(r)
        elif mode == 'slow-reader': slow(r)
        else:
            count = 0
            for key in keys(r): count += r.cmd('UNLINK',key)
            print(f'Removed {count} experiment keys from DB 3 only.')
    finally: r.close()
if __name__ == '__main__': main()
