# Granolie

Granolie is a Linux-first local app modeled on Granola's core flow:

- record or import meeting audio
- transcribe it with either an OpenAI-compatible API or local faster-whisper
- generate structured AI notes from the transcript
- edit and export the result as markdown
- keep sessions saved locally on disk

## What is implemented

- Electron desktop shell for Linux
- local Node server embedded behind the desktop app
- disk-backed session storage in `data/sessions/`
- browser microphone capture with `MediaRecorder`, a live input-level meter, computer-audio loopback, and no fixed server-side upload size ceiling
- copy AI notes or transcripts to the clipboard, export either as Markdown, text, or Writer-compatible HTML, or paste either automatically into a new LibreOffice Writer document
- keep the workspace focused with collapsible AI settings, meeting details, and per-pane action menus
- native two-finger-tap/right-click edit menus for text fields, including Cut, Copy, Paste, and Select All
- LibreOffice Writer integration via UNO, which creates a new document and invokes Writer's own Paste command without simulated keystrokes
- audio file import
- import text, Markdown, CSV, TSV, log, or JSON files into the transcript of a newly created note
- transcript and notes editors with autosave
- note templates for general meetings, standups, 1:1s, sales calls, interviews, and custom prompts
- configurable transcription and notes providers, API URLs, and models
- fresh profiles default to local Ollama `phi4-mini` notes and local faster-whisper `base` transcription; later launches retain the last used AI settings
- a ChatGPT-like `Ask Granolie` workspace is the default view, with an anchored composer, Enter-to-send, Shift+Enter for a new line, and clickable session sources for each local answer
- a branded, animated local-AI activity indicator for saved-note questions, transcription, and note generation, with reduced-motion support
- switch to the `Session` workspace to record, transcribe, edit, and export a single note

## Desktop run

```bash
npm start
```

This launches the Electron desktop app and starts its local backend on an ephemeral localhost port automatically.

For restricted environments where Chromium sandboxing is a problem:

```bash
npm run start:unsafe
```

## Package for Linux

Build an unpacked Linux app directory:

```bash
npm run package
```

That produces:

- `dist/linux-unpacked/granolie`

Build only the AppImage:

```bash
npm run dist:appimage
```

Build only the Debian package from the unpacked app:

```bash
npm run dist:deb
```

Build both Linux distributables:

```bash
npm run dist:linux
```

That produces:

- `dist/Granolie-0.1.0-x86_64.AppImage`
- `dist/Granolie-0.1.0-amd64.deb`

## Web fallback

You can still run the browser version directly:

```bash
npm run start:web
```

## Test

```bash
npm test
```

## Local Ollama notes

Recommended local setup:

```bash
ollama pull phi4-mini
```

Then in the app:

1. Click `Use local phi4-mini`
2. Keep the notes provider on `Ollama local`
3. Leave the notes URL at `http://127.0.0.1:11434`
4. Generate notes from the transcript locally

You can also type any installed Ollama model name directly into the notes model field.

## Local faster-whisper transcription

Granolie also supports fully local transcription through `faster-whisper`.

Recommended local setup on Arch:

```bash
sudo pacman -S python uv
```

Then in the app:

1. Click `Use local faster-whisper`
2. Keep the transcription provider on `Local faster-whisper`
3. Start with the `base` model unless you know your CPU can handle something larger
4. Transcribe audio locally

Notes:

- The first local transcription run may take longer because `uv` may need to download the Python dependencies and the selected Whisper model.
- If the desktop launcher cannot find `uv`, start Granolie from a shell or set `GRANOLIE_UV_BIN` to the absolute path of your `uv` binary.

## Notes

- The API key is stored in the desktop app's browser storage, not on the server.
- Audio is kept in the active browser tab and is not saved to disk by the app.
- In repo mode, saved sessions are JSON files under `data/sessions/`.
- In packaged desktop mode, saved sessions move to the Electron user data directory for the current Linux user.
- This version is intentionally local-first and conservative: it transcribes after recording rather than doing continuous live transcription.
- Local notes and local transcription are configured separately on purpose. You can run either side locally without forcing the other one to change.
- Linux package metadata is now anchored to the GitHub project URL and the support address `granolie.support@gmail.com`.
