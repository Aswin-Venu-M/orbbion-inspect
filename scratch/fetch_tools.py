import json, urllib.request
req = urllib.request.Request('http://127.0.0.1:3845/mcp', data=b'{"jsonrpc":"2.0","id":1,"method":"tools/list"}', headers={'Content-Type': 'application/json'})
print(urllib.request.urlopen(req).read().decode())
