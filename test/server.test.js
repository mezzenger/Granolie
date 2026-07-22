const test = require("node:test");
const assert = require("node:assert/strict");
const { Readable } = require("node:stream");

const {
  buildNotePrompt,
  buildSessionQuestionPrompt,
  deriveTitle,
  isGreetingQuestion,
  normalizeAiProvider,
  normalizeBaseUrl,
  normalizeTranscriptionProvider,
  requestHandler,
  selectQuestionSessions,
} = require("../server");

test("normalizeBaseUrl trims a trailing slash", () => {
  assert.equal(normalizeBaseUrl("https://api.openai.com/v1/"), "https://api.openai.com/v1");
});

test("normalizeAiProvider falls back to openai", () => {
  assert.equal(normalizeAiProvider("ollama"), "ollama");
  assert.equal(normalizeAiProvider("anything-else"), "openai");
});

test("normalizeTranscriptionProvider falls back to openai", () => {
  assert.equal(normalizeTranscriptionProvider("faster_whisper"), "faster_whisper");
  assert.equal(normalizeTranscriptionProvider("anything-else"), "openai");
});

test("deriveTitle falls back cleanly for empty transcript", () => {
  assert.equal(deriveTitle(""), "Untitled session");
});

test("buildNotePrompt includes context and transcript", () => {
  const prompt = buildNotePrompt({
    transcript: "Alice shipped the feature.",
    template: "standup",
    context: "Internal engineering sync",
    customPrompt: "Highlight blockers.",
  });

  assert.match(prompt, /Internal engineering sync/);
  assert.match(prompt, /Alice shipped the feature/);
  assert.match(prompt, /Highlight blockers/);
});

test("selectQuestionSessions favors sessions that match the question", () => {
  const sessions = [
    {
      id: "one",
      title: "Budget review",
      notes: "The finance team approved the revised budget.",
      transcript: "",
      updatedAt: "2026-07-21T00:00:00.000Z",
    },
    {
      id: "two",
      title: "Design sync",
      notes: "Reviewed button spacing.",
      transcript: "",
      updatedAt: "2026-07-22T00:00:00.000Z",
    },
  ];

  const selected = selectQuestionSessions(sessions, "Who approved the budget?");
  assert.equal(selected[0].id, "one");
});

test("buildSessionQuestionPrompt names sources and requires citations", () => {
  const prompt = buildSessionQuestionPrompt({
    question: "What was decided?",
    sessions: [{ title: "Planning", notes: "Ship Friday.", transcript: "" }],
  });

  assert.match(prompt, /SOURCE: Planning/);
  assert.match(prompt, /\[Source: session title\]/);
});

test("isGreetingQuestion identifies simple greetings without searching sessions", () => {
  assert.equal(isGreetingQuestion("hello"), true);
  assert.equal(isGreetingQuestion("Good morning!"), true);
  assert.equal(isGreetingQuestion("What did we decide?"), false);
});

function createMockRequest(url) {
  const req = Readable.from([]);
  req.url = url;
  req.method = "GET";
  req.headers = { host: "127.0.0.1:3000" };
  return req;
}

function createMockResponse() {
  let statusCode = 0;
  let headers = {};
  const chunks = [];

  return {
    get body() {
      return Buffer.concat(chunks).toString("utf8");
    },
    get headers() {
      return headers;
    },
    get statusCode() {
      return statusCode;
    },
    end(chunk) {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
    },
    writeHead(nextStatusCode, nextHeaders) {
      statusCode = nextStatusCode;
      headers = nextHeaders || {};
    },
    write(chunk) {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
    },
  };
}

test("requestHandler serves health and index routes", async () => {
  const healthReq = createMockRequest("/api/health");
  const healthRes = createMockResponse();
  await requestHandler(healthReq, healthRes);
  assert.equal(healthRes.statusCode, 200);
  assert.deepEqual(JSON.parse(healthRes.body), { ok: true });

  const indexReq = createMockRequest("/");
  const indexRes = createMockResponse();
  await requestHandler(indexReq, indexRes);
  assert.equal(indexRes.statusCode, 200);
  assert.match(indexRes.body, /Granolie/);
});
