import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logDir = path.join(rootDir, "logs", "test-errors");
const kind = process.argv[2];
const maxNote = 4000;

const secretPat =
  /[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD|PASSWD)[A-Z0-9_]*=\S+/g;

if (kind !== "view" && kind !== "e2e") {
  process.stderr.write("usage: node scripts/run-checked.mjs view|e2e\n");
  process.exit(1);
}

const reportFile =
  kind === "view"
    ? path.join(logDir, ".view-report.json")
    : path.join(logDir, ".e2e-report.json");

await mkdir(logDir, { recursive: true });

const args =
  kind === "view"
    ? [
        path.join(rootDir, "node_modules/vitest/vitest.mjs"),
        "run",
        "--reporter=default",
        "--reporter=json",
        `--outputFile=${reportFile}`,
      ]
    : [path.join(rootDir, "node_modules/playwright/cli.js"), "test"];

const env = { ...process.env };
if (kind === "e2e") env.PW_JSON = reportFile;

const { code, note } = await runNode(args, env);
if (code === 0) process.exit(0);

const report = await readReport(reportFile);
await rm(reportFile, { force: true });
const abort = kind === "view" ? viewAbort(report, note, code) : e2eAbort(report, note, code);
if (!abort) process.exit(code);

await writeAbort(kind, abort);
process.exit(code);

function runNode(nodeArgs, env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, nodeArgs, {
      cwd: rootDir,
      env,
      stdio: ["inherit", "pipe", "pipe"],
    });
    let note = "";
    const push = (chunk, stream) => {
      const text = String(chunk);
      stream.write(text);
      if (note.length < maxNote) note += text.slice(0, maxNote - note.length);
    };
    child.stdout?.on("data", (chunk) => push(chunk, process.stdout));
    child.stderr?.on("data", (chunk) => push(chunk, process.stderr));
    child.on("error", (err) => {
      note += `\n${err.message}`;
      resolve({ code: 1, note });
    });
    child.on("close", (code) => {
      resolve({ code: code ?? 1, note });
    });
  });
}

async function readReport(file) {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clip(text) {
  return redact(text).replace(/\s+/g, " ").trim().slice(0, 500);
}

function redact(text) {
  return text.replace(secretPat, "[redacted]");
}

function isAssert(msg) {
  return /AssertionError|expected .* to |Error: expect\(|toBeVisible|toHaveText|toContainText/.test(
    msg,
  );
}

function isInfra(msg) {
  return /browserType\.launch|Executable doesn't exist|ECONNREFUSED|ERR_CONNECTION|has been closed|webServer|browser has disconnected|net::ERR_|ENOTFOUND|Failed to load|Cannot find module|Worker exited|SyntaxError|ReferenceError|Unknown Error|Timed out waiting/i.test(
    msg,
  );
}

function viewAbort(report, note, code) {
  if (!report) {
    return {
      stopped: "Viewtest（npm run test:run）。レポートが無く、ラン全体が止まった",
      problem: clip(note) || `終了コード ${code}`,
      unknown: "",
    };
  }
  const stopped = [];
  const problems = [];
  for (const file of report.testResults ?? []) {
    const fileName = path.relative(rootDir, file.name ?? "不明なファイル");
    if (file.message && !isAssert(file.message)) {
      stopped.push(`${fileName}（ファイルの読み込みで中止）`);
      problems.push(clip(file.message));
    }
    for (const test of file.assertionResults ?? []) {
      const msg = (test.failureMessages ?? []).join("\n");
      if (!msg || isAssert(msg) || !isInfra(msg)) continue;
      const title = [...(test.ancestorTitles ?? []), test.title]
        .filter(Boolean)
        .join(" / ");
      stopped.push(`${fileName} 「${title || "名称不明"}」`);
      problems.push(clip(msg));
    }
  }
  if (stopped.length === 0) return null;
  return {
    stopped: stopped.join("\n"),
    problem: problems.join("\n"),
    unknown: "",
  };
}

function e2eAbort(report, note, code) {
  if (!report) {
    return {
      stopped: "Playwright（npm run test:e2e）。レポートが無く、ラン全体が止まった",
      problem: clip(note) || `終了コード ${code}`,
      unknown: "",
    };
  }
  const stopped = [];
  const problems = [];
  for (const err of report.errors ?? []) {
    const msg = err.message ?? String(err);
    if (!msg) continue;
    stopped.push("Playwright の起動または開発サーバー（個別テスト名は無し）");
    problems.push(clip(msg));
  }
  walkSuite(report.suites ?? [], [], stopped, problems);
  if (stopped.length === 0) return null;
  return {
    stopped: [...new Set(stopped)].join("\n"),
    problem: [...new Set(problems)].join("\n") || "",
    unknown: problems.length ? "" : "原因を特定できなかった",
  };
}

function walkSuite(suites, titles, stopped, problems) {
  for (const suite of suites) {
    const next = [...titles, suite.title].filter(Boolean);
    for (const spec of suite.specs ?? []) {
      const specName = [...next, spec.title].filter(Boolean).join(" / ");
      for (const test of spec.tests ?? []) {
        const label = `${spec.file ?? "e2e"} 「${specName || test.projectName || "名称不明"}」`;
        for (const res of test.results ?? []) {
          const errs = [
            ...(res.errors ?? []),
            ...(res.error ? [res.error] : []),
          ];
          const msg = errs
            .map((err) => err?.message ?? "")
            .filter(Boolean)
            .join("\n");
          if (res.status === "interrupted") {
            stopped.push(label);
            problems.push(clip(msg) || "ランが中断され、このテストは完了しなかった");
          } else if (
            (res.status === "failed" || res.status === "timedOut") &&
            msg &&
            isInfra(msg) &&
            !isAssert(msg)
          ) {
            stopped.push(label);
            problems.push(clip(msg));
          }
        }
        if (test.status === "interrupted") {
          stopped.push(label);
          problems.push("ランが中断され、このテストは完了しなかった");
        }
      }
    }
    walkSuite(suite.suites ?? [], next, stopped, problems);
  }
}

async function writeAbort(kind, abort) {
  const when = tokyoStamp(new Date());
  const file = path.join(logDir, `${when.file}.md`);
  const problem = abort.problem
    ? `・${abort.problem.split("\n").join("\n・")}`
    : "・なし";
  const unknown = abort.unknown ? `・${abort.unknown}` : "・なし";
  const stopped = abort.stopped
    .split("\n")
    .map((line) => `・${line}`)
    .join("\n");
  const body = [
    "【記録日時】",
    `・${when.iso}`,
    "【中止したテスト】",
    stopped,
    "【判別できた問題】",
    problem,
    "【判別できなかったこと】",
    unknown,
    "",
  ].join("\n");
  await writeFile(file, body, "utf8");
  process.stderr.write(`\nテスト中断ログ: ${path.relative(rootDir, file)}\n`);
}

function tokyoStamp(date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((part) => [part.type, part.value]),
  );
  const day = `${parts.year}-${parts.month}-${parts.day}`;
  const time = `${parts.hour}-${parts.minute}-${parts.second}`;
  const clock = `${parts.hour}:${parts.minute}:${parts.second}`;
  return { file: `${day}T${time}+0900`, iso: `${day}T${clock}+09:00` };
}
