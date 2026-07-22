#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///

"""Open a private Writer instance and execute Writer's native Paste command."""

import os
import socket
import subprocess
import sys
import tempfile
import time

import uno


def reserve_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as listener:
        listener.bind(("127.0.0.1", 0))
        return listener.getsockname()[1]


def connect_to_writer(port):
    local_context = uno.getComponentContext()
    resolver = local_context.ServiceManager.createInstanceWithContext(
        "com.sun.star.bridge.UnoUrlResolver", local_context
    )
    connection = f"uno:socket,host=127.0.0.1,port={port};urp;StarOffice.ComponentContext"
    deadline = time.monotonic() + 15
    last_error = None

    while time.monotonic() < deadline:
        try:
            return resolver.resolve(connection)
        except Exception as error:  # Writer has not finished starting yet.
            last_error = error
            time.sleep(0.2)

    raise RuntimeError(f"LibreOffice did not accept its UNO connection: {last_error}")


def main():
    soffice = os.environ.get("GRANOLIE_LIBREOFFICE_BIN", "libreoffice")
    port = reserve_port()
    profile_path = tempfile.mkdtemp(prefix="granolie-writer-")
    profile_url = uno.systemPathToFileUrl(profile_path)
    accept = f"socket,host=127.0.0.1,port={port};urp;StarOffice.ComponentContext"

    try:
        subprocess.Popen(
            [
                soffice,
                "--nologo",
                "--norestore",
                f"--accept={accept}",
                f"-env:UserInstallation={profile_url}",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except OSError as error:
        raise RuntimeError("LibreOffice Writer was not found. Install libreoffice-fresh or libreoffice-still.") from error

    context = connect_to_writer(port)
    service_manager = context.ServiceManager
    desktop = service_manager.createInstanceWithContext("com.sun.star.frame.Desktop", context)
    document = desktop.loadComponentFromURL("private:factory/swriter", "_blank", 0, ())
    frame = document.getCurrentController().getFrame()
    frame.activate()
    frame.getContainerWindow().setFocus()

    dispatcher = service_manager.createInstanceWithContext("com.sun.star.frame.DispatchHelper", context)
    dispatcher.executeDispatch(frame, ".uno:Paste", "", 0, ())
    print('{"ok":true}')


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
