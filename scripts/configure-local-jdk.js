#!/usr/bin/env node
/**
 * Pins the local Gradle daemon to JDK 17 on Windows dev machines.
 *
 * Why: Gradle 8.14.3 (this project's version) doesn't support newer JDKs
 * (e.g. 25) that may also be installed as the machine's default JAVA_HOME —
 * without a pin, the Android build fails with a confusing
 * "Error resolving plugin [id: 'com.facebook.react.settings']" error instead
 * of a clear JDK-version message.
 *
 * This only runs locally on Windows. It intentionally no-ops on macOS/Linux
 * and in CI/EAS Build, where the environment's own JAVA_HOME should be left
 * alone (cloud builders use their own known-good JDK).
 *
 * Run automatically via the "postinstall" and "android" npm scripts. Safe to
 * re-run any time (idempotent) — e.g. after installing/moving a JDK.
 */

const fs = require('fs');
const path = require('path');

const GRADLE_PROPERTIES_PATH = path.join(__dirname, '..', 'android', 'gradle.properties');
const PIN_KEY = 'org.gradle.java.home';
const REQUIRED_MAJOR_VERSION = '17';

// Vendor install roots to search, in preference order. Each is scanned for a
// child directory whose bundled `release` file reports JAVA_VERSION 17.x.
const CANDIDATE_ROOTS = [
  'C:\\Program Files\\Eclipse Adoptium',
  'C:\\Program Files\\Microsoft',
  'C:\\Program Files\\Java',
  'C:\\Program Files\\Zulu',
];

function readJavaVersion(jdkDir) {
  try {
    const releaseFile = path.join(jdkDir, 'release');
    const content = fs.readFileSync(releaseFile, 'utf8');
    const match = content.match(/JAVA_VERSION="([\d.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function isJdk17(jdkDir) {
  const version = readJavaVersion(jdkDir);
  return !!version && version.split('.')[0] === REQUIRED_MAJOR_VERSION;
}

function findJdk17() {
  // Manual override always wins, for anyone whose install lives elsewhere.
  if (process.env.JDK17_HOME && isJdk17(process.env.JDK17_HOME)) {
    return process.env.JDK17_HOME;
  }

  for (const root of CANDIDATE_ROOTS) {
    let entries;
    try {
      entries = fs.readdirSync(root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const fullPath = path.join(root, entry.name);
      if (isJdk17(fullPath)) {
        return fullPath;
      }
    }
  }

  return null;
}

function updateGradleProperties(jdkPath) {
  let content = '';
  try {
    content = fs.readFileSync(GRADLE_PROPERTIES_PATH, 'utf8');
  } catch {
    console.warn(`configure-local-jdk: could not read ${GRADLE_PROPERTIES_PATH}, skipping.`);
    return;
  }

  const pinLineRegex = new RegExp(`^${PIN_KEY}=.*$`, 'm');
  const commentBlock =
    '# Pin the JDK Gradle itself runs on (Windows-local only; see scripts/configure-local-jdk.js).\n' +
    '# Regenerated automatically — do not hand-edit the path below.\n';
  const newLine = `${PIN_KEY}=${jdkPath.split(path.sep).join('/')}`;

  if (pinLineRegex.test(content)) {
    content = content.replace(pinLineRegex, newLine);
  } else {
    content = content.trimEnd() + '\n\n' + commentBlock + newLine + '\n';
  }

  fs.writeFileSync(GRADLE_PROPERTIES_PATH, content);
  console.log(`configure-local-jdk: pinned Gradle to JDK 17 at ${jdkPath}`);
}

function removePin() {
  let content = '';
  try {
    content = fs.readFileSync(GRADLE_PROPERTIES_PATH, 'utf8');
  } catch {
    return;
  }
  const pinLineRegex = new RegExp(`^${PIN_KEY}=.*\\n?`, 'm');
  if (pinLineRegex.test(content)) {
    fs.writeFileSync(GRADLE_PROPERTIES_PATH, content.replace(pinLineRegex, ''));
    console.log('configure-local-jdk: removed local JDK pin (not applicable here).');
  }
}

function main() {
  const isCi = !!(process.env.CI || process.env.EAS_BUILD);
  const isWindows = process.platform === 'win32';

  if (isCi || !isWindows) {
    // Cloud builds and non-Windows machines use their own environment's JDK.
    removePin();
    return;
  }

  const jdkPath = findJdk17();
  if (!jdkPath) {
    console.warn(
      'configure-local-jdk: no JDK 17 install found (checked Eclipse Adoptium/Microsoft/Java/Zulu ' +
        'under Program Files). Set JDK17_HOME to point at one, or install one, if the Android build ' +
        'fails with a Gradle plugin resolution error.'
    );
    removePin();
    return;
  }

  updateGradleProperties(jdkPath);
}

main();
