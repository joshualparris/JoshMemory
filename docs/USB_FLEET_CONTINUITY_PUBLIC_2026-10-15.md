# USB fleet 2026 — public-safe continuity handoff

**Snapshot date:** 15 October 2026. **Scope:** 22 numbered USB flash drives in a personal preservation and technician-toolkit project.  
**Evidence:** Previously verified records in the restricted USB inventory; Codex/Antigravity execution logs; user-reported changes on 14 October. This is **documentation**, not a new physical scan of the devices. It is deliberately redacted for this **public source-code repository**.

## The key correction for every coding agent

**All 22 numbered USBs (#1–#22) have already been inspected and catalogued. “We are up to USB #9” is outdated.** The work is not sequentially complete, however: multiple backups, live boot tests, media reliability checks and preservation decisions remain pending.

A local `MEMORY.md` or old Codex rollout can be older than the private canonical inventory. Always verify live device identity, the current private inventory, newer preservation logs and any JoshMemory private cloud handoff before making changes. An unattached USB is not evidence that work on it was never done.

## Public-safe fleet overview

The contents below intentionally exclude identifying media serial numbers, drive-by-drive private filenames, personal/medical details, private media, source-image hashes for private archives, machine paths, credentials and recovery content.

| USB | Device and general role | Last reported status / outstanding work |
|---|---|---|
| **#1** | Lexar ~4 GB, historical Lubuntu/tool files | Preserve prior state; historical boot configuration problems. A replacement boot image was **planned**, not confirmed installed. |
| **#2** | SanDisk 16 GB, Rescuezilla standalone | Tool image recorded; real backup/restore and physical boot validation remain to be demonstrated. |
| **#3** | Transcend ~2 GB, antiX 32-bit | Prior I/O reliability concern; avoid relying on it for unique data or critical boot operations. |
| **#4** | ~1 GB flash, Memtest86+ 8.10 | Rebuilt and read-back checked; physical boot still unverified. Earlier material backed up separately. |
| **#5** | SanDisk ~4 GB, SystemRescue 13.02 | ISO/hash read-back reported; physical boot still unverified. Earlier material backed up separately. |
| **#6** | SanDisk 16 GB, Ventoy 1.1.17 (`USB6_TOOLS`) | **Seven ISO files**: Ubuntu, Mint, Clonezilla, GParted, Debian installer, Alpine, and **ShredOS**. The ShredOS ISO was SHA-256 checked on-device, disconnected/reconnected, rechecked and safely ejected. Physical ShredOS/nwipe boot evidence not confirmed in the inspected records; a later operation was reported as using this USB for boot/erasure, with outcome unverified. |
| **#7** | ~250 MB generic USB, portable troubleshooting notes/scripts | Toolkit staging completed; any script should be reviewed and execution-tested before relying on it. Earlier files separately backed up. |
| **#8** | Lexar ~16 GB, Ventoy multiboot | Windows install/recovery and repair images; selected Ventoy menu booted, but individual ISO compatibility remains partly untested. |
| **#9** | ~16 GB USB, experimental repaired controller | Ventoy with Fedora, Kali, Q4OS and antivirus rescue images. Four ISO checks were reported after a reconnection; **historic controller/capacity failure means experimental only**, even if later tests passed. Some old logs show incomplete checks, superseded only when a newer explicit verification exists. |
| **#10** | ~1 GB USB, Lubuntu 18-era image and historical files | Independent NAS preservation and source-image hash verification reported; preserve original. |
| **#11** | ~16 GB USB, Windows 10 64-bit installer | Backups and physical boot not fully verified. |
| **#12** | Imation ~4 GB, Damn Small Linux 2024 RC1 | Preserve/boot-test as appropriate. |
| **#13** | SanDisk ~32 GB, Windows installer plus **restricted private archive** | Complete compressed raw acquisition and local SHA-256 verification reported, with zero read errors. **14 October later update:** a file-level NAS copy of **1,274 files / 4,052,656,970 bytes** was independently read back and matched by hashes; **off-device raw-disk-image backup remains separate/unconfirmed**. Do not expose archive contents. |
| **#14** | Generic ~32 GB, historical MIDI/data medium with damaged partition structure | MBR region damaged/zeroed; filesystem detected at nonstandard offset. A complete raw-image acquisition was subsequently **reported**, but independent image/restore verification and backup disposition remain to be confirmed. Do not format or repair original before verification. |
| **#15** | Generic ~16 GB, restricted private video archive | Complete raw image **15,623,782,400 bytes** and file/container checks reported with zero read errors. **Independent off-device image backup still unconfirmed**. No personal video content in public records. |
| **#16** | Generic ~512 MB, historic audio recordings | Previously unstable connection, later readable; **preservation and independent backup not confirmed**. Copy while stable; avoid repeated stress. |
| **#17** | ~1 GB USB with historical archived files | Read-only raw image made, verified and backed up to a **private** GitHub Release; round-trip hash reported. Original intermittently disconnected; archive/retire rather than reuse. |
| **#18** | Lexar ~4 GB, Office Click-to-Run distribution files | Inventory completed; not confirmed to be a standalone working installer. |
| **#19** | ~256 MB USB, restricted photo archive | Full image and independently verified private GitHub Release reported; images checked for readability. |
| **#20** | Generic ~32 GB | **CHANGED 14 OCT:** No longer empty. **Windows 11 installer created with Rufus with TPM requirement bypass enabled.** Real hardware boot test is **not confirmed**. Preserve this configuration; do not propose formatting it as a blank test USB. |
| **#21** | Generic ~32 GB | **16 OCT UPDATE: RETIRE - failed content verification persists after physical reconnect in a second ThinkPad port.** A checked read-only comparison of the full 2,004,299,776-byte Catalina recovery partition found 3,736 mismatching 4 KiB blocks (15,302,656 bytes; expected SHA-256 `8183369f3e1250c581bf8c5f515b46cf82e43f279db957d758a4e17b7aa4a071`, actual `51ff688186931ba962fdfe032c642a882eb531786f8ecd79eea027d2b22eb8be`). The read completed without OS read errors or new disk/StorPort events. Earlier claims of specific NAND geometry, thermal bit flips, ECC suppression, and a definitive controller/NAND cause are withdrawn as unverified. Do not use for Catalina recovery or valuable data; use a different verified USB. |
| **#22** | Kingston ~256 MB, restricted historic data | Full raw image verified and privately release-backed. File recovery from a working copy also reported. **Recovered files' independent off-device backup remained unconfirmed**; recovery quality is not the same as verified media decoding. |

### Confirmed public ShredOS addition on USB #6

- **Method:** Additive ISO copy into existing Ventoy 1.1.17 data partition; original six images retained; no repartitioning, reinstall, erase or unattended wipe during this addition.
- **File:** `shredos-2025.11_32_x86-64_v0.43.1_20261010.iso`
- **Size:** 358,612,992 bytes
- **Official/source and post-reconnect on-device SHA-256:** `d0ffb8d7b346289db93094dbf1d2a64692b7f7cb179cc1ca76b74fdffbac1414`
- **After adding:** 3,707,666,432 bytes free, according to the device readback log.
- **Not proved by the checksum alone:** physical ShredOS boot, `nwipe` operation, or completed drive erasure.

### Priorities / safe-next-action queue

1. **Safety and reconciliation first:** get the latest restricted master inventory and logs before issuing disk commands. Verify the exact attached device using multiple identifiers, never just `/dev/sdX`, `D:\`, size, or device order. Blank/missing serial numbers require physical labels and secondary evidence.
2. **Preservation first:** finish independently verified off-device backups for #15, #16 and any unbacked-up archive; validate #14's reported raw image and backup. #13's **file-level** NAS preservation is reported complete; **raw-image off-device** verification is a separate question.
3. **Protect the used USBs:** #20 is a Rufus Windows 11 installer; #21 is retired after repeated silent corruption. Do not overwrite #20 or reuse #21.
4. **Boot proof:** finish the USB #6 ShredOS boot/wipe *status check* without initiating or assuming an erase; then selected boot tests of #2, #4, #5, #8 and other toolkit media. Record machine firmware mode, software build, visible result and screenshot/log reference.
5. **Reliability:** keep #9 experimental due to controller history; do not interpret a successful checksum as lifetime device reliability. Do not run destructive capacity tests without explicit confirmation that content is expendable and safely backed up.
6. **Accountability:** after a verified milestone, update the restricted canonical catalogue, then add a **privacy-safe JoshMemory continuity handoff/project fact** in the private shared store. Read back the saved record and capture its source link/commit, time, machine and remaining action.

### Agent handoff / privacy guardrails

- **Source of truth:** live observations and the user's current actions; the restricted USB master catalogue and source reports; independently verified hashes; recent user changes. JoshMemory records and old local `MEMORY.md` are historical context, not overriding evidence.
- **Canonical location:** the private USB inventory under `docs/usb-inventory/` in the authorised Parris Tech Services application repository. The public JoshMemory source repo contains **this redacted navigation/status reference only**, not the full inventory.
- **Never publish here:** raw USB images, archive file contents, personal photos/videos/audio, health/medical scan details, deleted-file recovery lists, family names, identifying USB serials, private machine/NAS paths, tokens, passwords or file manifests.
- **Never claim completed:** mere task start, a stale memory entry, a file existing without complete hash verification, an ISO checksum without boot proof, a local copy without independent storage validation, or a drive erasure without its report.
- **Distinct roles:** this public document is **not** itself a saved private JoshMemory project fact or automatic Codex-session ingestion. Agents should also use the JoshMemory continuity workflow and confirm the private store was updated.

## Evidence/provenance levels

- **GitHub catalogue/reports:** verified here as text and prior pushes, **not** physically rechecked now.
- **Execution logs:** prove *reported* operations/results; verify at the original hardware or artefact when completion depends on them.
- **14 October changes (#20, #21, #13 and #14):** later-session/user reports; do not silently overwrite the earlier date-scoped catalogue without checked evidence.
- **Snapshot is intentionally partial where status is unknown.** Do not infer that a drive is empty, expendable, ready for reuse or erased.
