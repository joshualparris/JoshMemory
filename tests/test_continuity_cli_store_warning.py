from unittest.mock import patch

from joshmemory import continuity_cli


def test_local_store_warns_that_empty_results_are_unknown(tmp_path, capsys):
    db = str(tmp_path / "memory.sqlite")
    with patch("joshmemory.central.storage_mode", return_value="local"), patch(
        "joshmemory.continuity.storage_mode", return_value="local"
    ):
        assert continuity_cli.main(["--db", db, "leases", "--project", "AutoPatch"]) == 0
    captured = capsys.readouterr()
    assert captured.out.strip() == "[]"
    assert "UNKNOWN, not as none" in captured.err


def test_shared_store_does_not_warn(tmp_path, capsys):
    db = str(tmp_path / "memory.sqlite")
    with patch("joshmemory.central.storage_mode", return_value="github"), patch(
        "joshmemory.continuity_cli.list_leases", return_value=[]
    ):
        assert continuity_cli.main(["--db", db, "leases", "--project", "AutoPatch"]) == 0
    assert "WARNING" not in capsys.readouterr().err


def test_resume_works_on_a_fresh_machine_without_a_data_dir(tmp_path):
    db = str(tmp_path / "missing" / "dir" / "memory.sqlite")
    with patch("joshmemory.central.storage_mode", return_value="local"), patch(
        "joshmemory.continuity.storage_mode", return_value="local"
    ):
        assert continuity_cli.main(["--db", db, "resume", "AutoPatch"]) == 0
