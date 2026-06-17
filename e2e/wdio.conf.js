import os from "os";
import path from "path";
import {spawn, spawnSync} from "child_process";
import {fileURLToPath} from "url";
import fs from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// keep track of the `tauri-driver` child process
let tauriDriver;
let exit = false;

// Create a temporary directory for E2E test app data to avoid conflicts with production
const testAppDataDir = path.join(os.tmpdir(), `sias-e2e-test-${Date.now()}`);
fs.mkdirSync(testAppDataDir, { recursive: true });

export const config = {
    host: "127.0.0.1",
    port: 4444,
    specs: ["./test/specs/**/*.js"],
    maxInstances: 1,
    capabilities: [
        {
            maxInstances: 1,
            "tauri:options": {
                application: "../src-tauri/target/debug/app",
                // Pass environment variables to isolate the test database and cache
                env: {
                    APPDATA: testAppDataDir, // Override APPDATA on Windows to isolate app data
                    XDG_DATA_HOME: testAppDataDir, // For Linux/macOS compatibility
                    HOME: testAppDataDir, // Fallback for some path resolutions
                }
            }
        }
    ],
    reporters: ["spec"],
    framework: "mocha",
    mochaOpts: {
        ui: "bdd",
        timeout: 60000,
    },

    // ensure the rust project is build since we expect this binary to exists for the webdriver sessions
    onPrepare: () => {
        spawnSync("pnpm", ["tauri", "build", "--debug", "--no-bundle"], {
            cwd: path.resolve(__dirname, "../"),
            stdio: "inherit",
            shell: true,
        });
    },

    // ensure we are running `tauri-driver` before the session starts so that we can proxy the webdriver requests
    beforeSession: () => {
        tauriDriver = spawn(
            path.resolve(os.homedir(), ".cargo", "bin", "tauri-driver"),
            [],
            { stdio: [null, process.stdout, process.stderr] }
        );

        tauriDriver.on("exit", (code) => {
            if (!exit) {
                console.error("tauri-driver exited with code: ", code);
                process.exit(1);
            }
        });
    },

    // clean up the `tauri-driver` process we spawned at the start of the session
    afterSession: () => {
        closeTauriDriver();
        // Clean up the temporary directory to ensure no cache is stored
        try {
            fs.rmSync(testAppDataDir, { recursive: true, force: true });
        } catch (err) {
            console.error("Failed to clean up test app data directory:", err);
        }
    }
};

function closeTauriDriver(){
    exit = true;
    tauriDriver?.kill();
}

function onShutdown(fn) {
    const cleanup = () => {
        try {
            fn();
        } finally {
            process.exit();
        }
    };

    process.on("exit", cleanup);
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("SIGHUP", cleanup);
    process.on("SIGBREAK", cleanup);
}

onShutdown(() => {
    closeTauriDriver();
});
