# Mammoth Ops Notes

## Environment Contract

### Public web env
- `NEXT_PUBLIC_PROGRAM_ID`
- `NEXT_PUBLIC_CLUSTER`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_JUPITER_RPC_ENDPOINT`

### Server-only env
- `GROQ_API_KEY`

## Current defaults
- Cluster defaults to `devnet`
- Public RPC defaults to `https://api.devnet.solana.com`
- Jupiter RPC fallback defaults to `https://api.mainnet-beta.solana.com`

## Ops recommendations
- Use explicit env values per environment (dev / preview / prod)
- Do not rely on `.env.local` alone for production deploys
- Keep public env values aligned with actual deployed cluster/program
- Validate server-only env requirements at runtime or startup

## Image policy
The app should prefer a restricted allowlist of remote image hosts instead of broad `hostname: '**'` patterns.
If new remote image providers are introduced, add them explicitly.
