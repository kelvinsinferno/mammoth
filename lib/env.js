const REQUIRED_AT_RUNTIME = {
  chat: ['GROQ_API_KEY'],
};

function getPublicEnv() {
  return {
    programId: process.env.NEXT_PUBLIC_PROGRAM_ID || 'DUnfGXcmPJgjSHvrPxeqPPYjrx6brurKUBJ4cVGVFR31',
    cluster: process.env.NEXT_PUBLIC_CLUSTER || 'devnet',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
    jupiterRpcUrl: process.env.NEXT_PUBLIC_JUPITER_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
  };
}

function requireServerEnv(group) {
  const missing = (REQUIRED_AT_RUNTIME[group] || []).filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env for ${group}: ${missing.join(', ')}`);
  }
}

module.exports = {
  getPublicEnv,
  requireServerEnv,
};
