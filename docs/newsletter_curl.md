# Newsletter API examples

```sh
# subscribe
curl -X POST http://localhost:5000/api/newsletter \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com"}'

# check status (requires auth cookie)
curl http://localhost:5000/api/newsletter/status
```
