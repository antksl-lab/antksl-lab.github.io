# ANTKSL ZIP Handoff Law V1

Mandatory operator sequence for every runnable Windows ZIP:

ZIP -> one ready-to-paste PowerShell command -> exact SHA256 verification -> extract under C:\\ANTKSL_WORK -> run exact entrypoint -> write durable RESULT.txt/RESULT_ZIP -> copy the safe result text to clipboard -> operator pastes it back -> independent verification -> next gate.

Rules:
- Never assume Downloads.
- The operator must not browse folders to find the entrypoint.
- Fail closed on missing ZIP, SHA mismatch, ambiguity, missing entrypoint, baseline drift, parser/compile failure, or unresolved authority.
- Clipboard is never the only evidence carrier; durable result files are mandatory.
- Immediately after the ZIP link give the exact PowerShell command.
- State the exact BAT/PS1, expected FINISH marker, any unavoidable human input, and RESULT path.
- After the pasted result, verify it and prepare the next admissible package immediately when possible.
- Superseded packages: OBSOLETE — DO NOT USE.

Canonical short form:

ZIP -> POWERSHELL -> VERIFY -> EXTRACT -> RUN -> DURABLE RESULT -> CLIPBOARD -> PASTE BACK -> VERIFY -> NEXT GATE.
