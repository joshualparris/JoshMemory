"""Deterministic fixtures for whole-repository audit; no GitHub credentials."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "tools" / "audit_open_tasks.py"
spec = importlib.util.spec_from_file_location("audit_open_tasks", SCRIPT)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)

class TaskAuditTest(unittest.TestCase):
    def test_keep_existing_ids(self):
        self.assertEqual(audit.existing_task_id("**RTD-010** Keep NPC actor keys"), "RTD-010")
        self.assertEqual(audit.existing_task_id("**TR-003.01** Check claim"), "TR-003.01")
        self.assertEqual(audit.existing_task_id("RT-U032 legacy parent"), "RT-U032")
        self.assertEqual(audit.existing_task_id("AUDIO-007.02 stop"), "AUDIO-007.02")
        self.assertEqual(audit.existing_task_id("**NR-REAL-002** Walk the town"), "NR-REAL-002")

    def test_skip_completed_checkboxes_and_allocate_unlabelled(self):
        src = "\n".join([
            "# Town tasks",
            "1. [x] **Old fixed** (do not open)",
            "2. [ ] **Remaining actual trees**",
            "- [ ] **RTN-009** Fix crowd collision",
        ])
        items = audit.scan_markdown("repository-town/docs/NARROMINE_REALISM_TODO.md", src)
        self.assertEqual(len(items), 2)
        self.assertIsNone(items[0]["task_id"] or None)
        self.assertEqual(items[1]["task_id"], "RTN-009")
        mapping = {"schema_version": 1, "next_number": 1, "ids": {}}
        result = audit.merge_tasks({}, items, mapping)
        self.assertEqual(len(result), 2)
        unnumbered = next(x for x in result if x["title"].startswith("Remaining"))
        self.assertEqual(unnumbered["task_id"], "JMU-00001")
        later = audit.merge_tasks({}, items, mapping)
        self.assertEqual(next(x for x in later if x["title"].startswith("Remaining"))["task_id"], "JMU-00001")
        self.assertEqual(mapping["next_number"], 2)

    def test_references_do_not_create_duplicates(self):
        item = audit.task("RTN-009 Fix crowd collision", "doc.md", 14, given_id="RTN-009")
        master = {"RTN-009": audit.task("Existing NPC task", "old.csv", 5, given_id="RTN-009")}
        mapping = {"schema_version": 1, "next_number": 1, "ids": {}}
        result = audit.merge_tasks(master, [item], mapping)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["source_file"], "old.csv")
        self.assertEqual(len(mapping["ids"]), 0)

    def test_code_todo_not_arbitrary_mentions(self):
        src = "\n".join([
            'const label = "TODO not a real code comment";',
            "// TODO: Reconcile camera orientation with aerial imagery",
            "# FIXME: Repair blocked mobile menu navigation",
            "/* TODO: Fill in test coverage */",
        ])
        found = audit.scan_code("src/world/demo.js", src)
        self.assertEqual(len(found), 3)
        self.assertEqual(found[0]["title"], "Reconcile camera orientation with aerial imagery")

    def test_historical_master_is_separate_from_live_evidence(self):
        self.assertEqual(audit.priority_for("privacy leak in public output", "docs/roadmap.md"), "P0")
        self.assertEqual(audit.priority_for("Document a research inventory", "docs/roadmap.md"), "P2")
        self.assertEqual(audit.source("repository-town/foo.js", 41),
                         "https://github.com/joshualparris/JoshMemory/blob/main/repository-town/foo.js#L41")

if __name__ == "__main__":
    unittest.main()
