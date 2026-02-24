type StateDirEnvSnapshot = {
  nexaStateDir: string | undefined;
  clawdbotStateDir: string | undefined;
};

export function snapshotStateDirEnv(): StateDirEnvSnapshot {
  return {
    nexaStateDir: process.env.NEXA_STATE_DIR,
    clawdbotStateDir: process.env.CLAWDBOT_STATE_DIR,
  };
}

export function restoreStateDirEnv(snapshot: StateDirEnvSnapshot): void {
  if (snapshot.nexaStateDir === undefined) {
    delete process.env.NEXA_STATE_DIR;
  } else {
    process.env.NEXA_STATE_DIR = snapshot.nexaStateDir;
  }
  if (snapshot.clawdbotStateDir === undefined) {
    delete process.env.CLAWDBOT_STATE_DIR;
  } else {
    process.env.CLAWDBOT_STATE_DIR = snapshot.clawdbotStateDir;
  }
}

export function setStateDirEnv(stateDir: string): void {
  process.env.NEXA_STATE_DIR = stateDir;
  delete process.env.CLAWDBOT_STATE_DIR;
}
