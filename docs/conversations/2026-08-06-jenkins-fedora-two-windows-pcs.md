# Jenkins setup on Fedora and two Windows PCs

**Conversation started:** 2026-08-06T03:50:26Z
**Archived:** 2026-09-25
**Source:** current ChatGPT conversation
**Repository:** joshualparris/JoshMemory

## User

help me setup jenkins on fedora and 2 windows pcs

## Assistant response preserved

The assistant proposed a three-machine Jenkins layout:

- Fedora as the Jenkins controller.
- The Lenovo Windows PC as a build agent named `windows-thinkpad`.
- A second Windows PC as a build agent named `windows-pc2`.
- Jenkins HTTP on port 8081 because another local service was already using port 8080.
- Java 21 for the controller and both Windows agents.
- Fedora installation via the official Jenkins RPM repository and systemd.
- Fedora firewall access limited to the local network.
- Initial Jenkins setup through the browser.
- The built-in controller node configured with zero executors so builds run on agents instead.
- Both Windows PCs prepared with Microsoft OpenJDK 21 and Git.
- Connectivity from Windows to the Fedora Jenkins service verified before agent setup.
- Two permanent Jenkins nodes created with one executor each and labels matching their machine names.
- Windows agents connected to the controller using Jenkins inbound WebSocket agents.
- Each Windows agent configured to start automatically at Windows startup.
- A Jenkins Pipeline test supplied that ran parallel stages on both Windows agents and printed host, account, Java and Git information.

The original assistant response also included exact shell and PowerShell commands for installation, firewall configuration, agent bootstrap, automatic startup and the test pipeline.

**Public-repository security sanitisation:** Exact private-network addressing and Jenkins enrolment/credential-handling commands from the original response are intentionally not reproduced in this public archive. No actual credential value was supplied by the user in this conversation.

## User — 2026-09-25T10:36:23Z

Push this whole conversation to our most relevant GitHub repo

## Archive note

This is the closest safe public-repository preservation of the thread. It records the full technical intent, topology, decisions and implementation steps while excluding the narrow infrastructure/enrolment material that should not be published in a public repository.
